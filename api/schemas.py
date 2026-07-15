"""Request / response models for the asset API."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

AssetKind = Literal["character", "building", "flora", "path"]
ImageQuality = Literal["low", "medium", "high"]
ImageSize = Literal["1024x1024", "1024x1536", "1536x1024"]


class GenerateRequest(BaseModel):
    """Generate a game asset from a kind template + subject, or a raw prompt."""

    name: str = Field(
        default="asset",
        min_length=1,
        max_length=64,
        description="Base filename stem (sanitized)",
    )
    kind: AssetKind | None = Field(
        default=None,
        description="Template kind: character | building | flora | path",
    )
    subject: str | None = Field(
        default=None,
        description="Filled into {{subject}} in the kind template",
    )
    prompt: str | None = Field(
        default=None,
        description="Raw full prompt (escape hatch; skips template)",
        min_length=1,
    )
    size: ImageSize | None = None
    quality: ImageQuality | None = None
    extra: str | None = Field(
        default=None,
        description="Optional {{extra}} placeholder content",
    )


class GenerateResponse(BaseModel):
    success: bool
    name: str
    kind: str | None = None
    image_path: str | None = None
    image_url: str | None = None
    prompt_used: str | None = None
    model: str | None = None
    quality: str | None = None
    size: str | None = None
    notes: str | None = None
    error: str | None = None
    raw: dict[str, Any] | None = None


class KindInfo(BaseModel):
    kind: str
    template: str
    default_size: str
    description: str


class HealthResponse(BaseModel):
    ok: bool
    model: str
    quality: str
    default_size: str
    openai_key_configured: bool
    output_dir: str
    kinds: list[str]
