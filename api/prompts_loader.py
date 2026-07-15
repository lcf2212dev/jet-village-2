"""Load and fill prompt templates from prompts/."""

from __future__ import annotations

from pathlib import Path

from kinds import get_kind


def load_template_file(prompts_dir: Path, filename: str) -> str:
    path = prompts_dir / filename
    if not path.is_file():
        raise FileNotFoundError(f"Prompt template not found: {path}")
    return path.read_text(encoding="utf-8")


def strip_frontmatter(body: str) -> str:
    """Remove optional YAML frontmatter between --- lines."""
    text = body.lstrip()
    if not text.startswith("---"):
        return body
    end = text.find("\n---", 3)
    if end == -1:
        return body
    return text[end + 4 :].lstrip("\n")


def render_template(
    template_body: str,
    *,
    subject: str,
    extra: str = "",
) -> str:
    body = strip_frontmatter(template_body)
    return (
        body.replace("{{subject}}", subject.strip())
        .replace("{{extra}}", (extra or "").strip())
        .strip()
    )


def build_prompt_for_kind(
    prompts_dir: Path,
    *,
    kind: str,
    subject: str,
    extra: str | None = None,
) -> tuple[str, str]:
    """Return (prompt_text, default_size) for a registered kind."""
    spec = get_kind(kind)
    raw = load_template_file(prompts_dir, spec.template)
    filled = render_template(raw, subject=subject, extra=extra or "")
    return filled, spec.default_size
