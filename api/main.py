"""Jet Village 2 — FastAPI asset generation (OpenAI Images API)."""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from kinds import KINDS, get_kind, list_kind_ids
from openai_client import generate_image, key_configured
from prompts_loader import build_prompt_for_kind
from schemas import GenerateRequest, GenerateResponse, HealthResponse, KindInfo
from settings import ROOT, settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jetv2.api")

app = FastAPI(
    title="Jet Village 2 Asset API",
    version="0.1.0",
    description=(
        "Gera assets pixel art via OpenAI Images API "
        "(gpt-image-2, quality high) a partir de templates em prompts/."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

settings.asset_output_dir.mkdir(parents=True, exist_ok=True)
app.mount(
    "/files",
    StaticFiles(directory=str(settings.asset_output_dir)),
    name="files",
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        ok=True,
        model=settings.openai_image_model,
        quality=settings.openai_image_quality,
        default_size=settings.openai_image_size,
        openai_key_configured=key_configured(settings),
        output_dir=str(settings.asset_output_dir),
        kinds=list_kind_ids(),
    )


@app.get("/v1/kinds", response_model=list[KindInfo])
def kinds() -> list[KindInfo]:
    return [
        KindInfo(
            kind=spec.kind,
            template=spec.template,
            default_size=spec.default_size,
            description=spec.description,
        )
        for spec in KINDS.values()
    ]


@app.post("/v1/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    prompt_used: str
    size = req.size or settings.openai_image_size
    quality = req.quality or settings.openai_image_quality
    kind = req.kind

    if req.prompt and req.prompt.strip():
        prompt_used = req.prompt.strip()
        if not size and kind:
            try:
                size = get_kind(kind).default_size
            except KeyError:
                size = settings.openai_image_size
    else:
        if not kind:
            raise HTTPException(
                status_code=400,
                detail="Provide either 'prompt' or 'kind' (+ subject)",
            )
        if not req.subject or not req.subject.strip():
            raise HTTPException(
                status_code=400,
                detail="subject is required when using kind templates",
            )
        try:
            prompt_used, kind_size = build_prompt_for_kind(
                settings.prompts_dir,
                kind=kind,
                subject=req.subject,
                extra=req.extra,
            )
        except KeyError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        if req.size is None:
            size = kind_size

    logger.info(
        "generate name=%s kind=%s size=%s quality=%s chars=%d",
        req.name,
        kind,
        size,
        quality,
        len(prompt_used),
    )

    result = generate_image(
        settings,
        prompt=prompt_used,
        name=req.name,
        size=size,
        quality=quality,
        kind=kind,
    )

    if not result.success or result.image_path is None:
        return GenerateResponse(
            success=False,
            name=req.name,
            kind=kind,
            prompt_used=prompt_used,
            model=settings.openai_image_model,
            quality=quality,
            size=size,
            error=result.error or "generation failed",
            raw=result.raw,
        )

    path = result.image_path.resolve()
    # URL relative to /files mount (includes kind subdir if any)
    try:
        rel = path.relative_to(settings.asset_output_dir.resolve())
        image_url = f"/files/{rel.as_posix()}"
    except ValueError:
        image_url = f"/files/{path.name}"

    return GenerateResponse(
        success=True,
        name=req.name,
        kind=kind,
        image_path=str(path),
        image_url=image_url,
        prompt_used=prompt_used,
        model=settings.openai_image_model,
        quality=quality,
        size=size,
        notes=result.notes,
        raw=result.raw,
    )


@app.get("/v1/assets/{filename:path}")
def get_asset(filename: str) -> FileResponse:
    # Prevent path traversal
    base = settings.asset_output_dir.resolve()
    path = (settings.asset_output_dir / filename).resolve()
    if not str(path).startswith(str(base)) or not path.is_file():
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(path)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "jet-village-2-asset-api",
        "docs": "/docs",
        "health": "/health",
        "kinds": "/v1/kinds",
        "generate": "POST /v1/generate",
        "root": str(ROOT),
    }
