"""OpenAI Images API client (gpt-image-2)."""

from __future__ import annotations

import base64
import logging
import re
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from settings import Settings

logger = logging.getLogger(__name__)


@dataclass
class ImageResult:
    success: bool
    image_path: Path | None = None
    notes: str | None = None
    error: str | None = None
    raw: dict[str, Any] | None = None


def _sanitize_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", name.strip()).strip("-._")
    return cleaned[:64] or "asset"


def _api_key(settings: Settings) -> str:
    key = (settings.openai_api_key or "").strip()
    if key:
        return key
    import os

    return (os.environ.get("OPENAI_API_KEY") or "").strip()


def key_configured(settings: Settings) -> bool:
    return bool(_api_key(settings))


def generate_image(
    settings: Settings,
    *,
    prompt: str,
    name: str,
    size: str,
    quality: str,
    kind: str | None = None,
) -> ImageResult:
    """Call OpenAI images.generate and save PNG under asset_output_dir[/kind]."""
    api_key = _api_key(settings)
    if not api_key:
        return ImageResult(
            success=False,
            error="OPENAI_API_KEY not set (project .env or environment)",
        )

    try:
        from openai import OpenAI
    except ImportError:
        return ImageResult(
            success=False,
            error="openai package not installed — run: pip install -r api/requirements.txt",
        )

    client = OpenAI(api_key=api_key)
    model = settings.openai_image_model
    background = settings.openai_image_background or None

    kwargs: dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": quality,
        "n": 1,
    }
    # gpt-image models often return b64; request png when supported
    try:
        kwargs["output_format"] = "png"
    except Exception:
        pass

    if background:
        kwargs["background"] = background

    logger.info(
        "openai images.generate model=%s size=%s quality=%s chars=%d",
        model,
        size,
        quality,
        len(prompt),
    )

    try:
        response = client.images.generate(**kwargs)
    except TypeError as exc:
        # Retry without optional kwargs older SDKs reject
        msg = str(exc).lower()
        for optional in ("background", "output_format", "quality"):
            if optional in msg and optional in kwargs:
                kwargs.pop(optional, None)
        try:
            # Always keep quality if possible; drop only rejected keys already popped
            response = client.images.generate(**kwargs)
        except Exception as exc2:  # noqa: BLE001
            return ImageResult(success=False, error=f"OpenAI API error: {exc2}")
    except Exception as exc:  # noqa: BLE001
        # One more retry without background if API rejects it
        if "background" in kwargs:
            kwargs.pop("background", None)
            try:
                response = client.images.generate(**kwargs)
            except Exception as exc2:  # noqa: BLE001
                return ImageResult(success=False, error=f"OpenAI API error: {exc2}")
        else:
            return ImageResult(success=False, error=f"OpenAI API error: {exc}")

    data = getattr(response, "data", None) or []
    if not data:
        return ImageResult(success=False, error="OpenAI returned no image data", raw=_safe_dump(response))

    first = data[0]
    b64 = getattr(first, "b64_json", None)
    url = getattr(first, "url", None)

    out_dir = settings.asset_output_dir
    if kind:
        out_dir = out_dir / _sanitize_name(kind)
    out_dir.mkdir(parents=True, exist_ok=True)

    stamp = time.strftime("%Y%m%d-%H%M%S")
    stem = _sanitize_name(name)
    dest = out_dir / f"{stem}-{stamp}-{uuid.uuid4().hex[:8]}.png"

    try:
        if b64:
            dest.write_bytes(base64.b64decode(b64))
        elif url:
            import urllib.request

            urllib.request.urlretrieve(url, dest)  # noqa: S310 — OpenAI CDN URL
        else:
            return ImageResult(
                success=False,
                error="Image payload missing b64_json and url",
                raw=_safe_dump(response),
            )
    except Exception as exc:  # noqa: BLE001
        return ImageResult(success=False, error=f"Failed to save image: {exc}")

    rel_kind = f"{kind}/" if kind else ""
    notes = f"saved {dest.name} under {rel_kind}"
    return ImageResult(
        success=True,
        image_path=dest,
        notes=notes,
        raw={"model": model, "size": size, "quality": quality},
    )


def _safe_dump(response: Any) -> dict[str, Any] | None:
    try:
        if hasattr(response, "model_dump"):
            return response.model_dump()
        return {"repr": repr(response)[:500]}
    except Exception:
        return None
