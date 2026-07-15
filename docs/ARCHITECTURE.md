# Jet Village 2 — Arquitetura

## Visão

MMORPG cozy top-down pixel art.  
**Client** TypeScript + Canvas 2D (zero runtime deps).  
**Assets** via OpenAI Images API.  
**Server** multiplayer: roadmap (não na 0.1.0).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Client | TS strict, Vite, Canvas 2D |
| API de assets (dev) | FastAPI + SDK `openai` (`gpt-image-2`, `high`) |
| Prompts | Markdown em `prompts/` |
| Futuro server | WebSocket + tick autoritativo (Node/TS ou Python) |

## Camadas do client (meta)

```
src/main.ts          → composition root
src/core/            → ECS, loop, math, contracts, scenes (sem DOM)
src/game/            → componentes, sistemas, cenas de produto
src/platform/        → Canvas, teclado, pointer, HTTP loader
```

Regra: `core` ↛ `game|platform`; `game` → `core`; `platform` → `core`.

## Pipeline de assets

```
Skill / CLI → POST /v1/generate → OpenAI → public/assets/generated/
                                         → promote → public/assets/{sprites,tiles,ui,maps}/
```

Kinds: `character` | `building` | `flora` | `path`.

## Multiplayer (roadmap)

| Versão | Entrega |
|--------|---------|
| **0.1.0** | Client local; tick puro; 1 player; intent de input |
| **0.2.x** | Server authoritative; room join; sync transform + anim |
| **0.3.x** | Interest management; multi-entity; anti-cheat básico de input |

Estado a serializar (futuro):  
`{ entityId, x, y, dir, animState, animFrame, weaponId }`.

## Reuso do Jet Village 1

| Levar | Não levar |
|-------|-----------|
| Harness spec/worktree/ship | Conteúdo Jett / biomas / inventário |
| ECS + contracts + GameLoop + viewport | Geradores `tools/sprites` + paleta fechada |
| Direções 8-way, clip keys, WeaponDef | `assets:check` hash golden |
| Ideia mapa 4 quarteirões data-driven | Cenas/sistemas de combate completos |

## Pastas

| Path | Função |
|------|--------|
| `api/` | Geração de imagens |
| `prompts/` | Templates de estilo |
| `public/assets/generated/` | Saída bruta da API |
| `public/assets/{sprites,tiles,ui,maps}/` | Promovidos |
| `src/` | Client (core/game/platform) |
| `.claude/skills/` | Harness + assets |
