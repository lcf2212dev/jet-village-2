"""Runtime settings for the asset generation API (OpenAI Images)."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    asset_api_host: str = "127.0.0.1"
    asset_api_port: int = 8787
    # Served by Vite at /assets/generated/...
    asset_output_dir: Path = Field(default=ROOT / "public" / "assets" / "generated")

    openai_api_key: str = ""
    openai_image_model: str = "gpt-image-2"
    openai_image_quality: str = "high"
    openai_image_size: str = "1024x1024"
    # Prefer transparent when the model supports it
    openai_image_background: str = "transparent"

    prompts_dir: Path = Field(default=ROOT / "prompts")
    root_dir: Path = Field(default=ROOT)


settings = Settings()
settings.asset_output_dir.mkdir(parents=True, exist_ok=True)
