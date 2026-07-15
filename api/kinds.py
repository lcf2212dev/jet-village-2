"""Registry of asset kinds → prompt templates and defaults."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KindSpec:
    kind: str
    template: str
    default_size: str
    description: str


KINDS: dict[str, KindSpec] = {
    "character": KindSpec(
        kind="character",
        template="character_sheet.md",
        default_size="1024x1536",
        description="Animated character/creature sprite sheet (idle/walk/run/action/hit/ko)",
    ),
    "building": KindSpec(
        kind="building",
        template="building.md",
        default_size="1024x1024",
        description="Single building/house prop sprite",
    ),
    "flora": KindSpec(
        kind="flora",
        template="flora.md",
        default_size="1024x1024",
        description="Tree, bush, or plant prop sprite",
    ),
    "path": KindSpec(
        kind="path",
        template="path_tile.md",
        default_size="1024x1024",
        description="Path / floor tile or tile set sprite",
    ),
}


def list_kind_ids() -> list[str]:
    return list(KINDS.keys())


def get_kind(kind: str) -> KindSpec:
    try:
        return KINDS[kind]
    except KeyError as exc:
        known = ", ".join(list_kind_ids())
        raise KeyError(f"Unknown kind '{kind}'. Known: {known}") from exc
