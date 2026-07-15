# Jet Village 2

MMORPG cozy top-down pixel art (client multiplayer-ready).  
Assets via **OpenAI Images** (`gpt-image-2` / high). Harness Claude-First em `CLAUDE.md`.

## Estado

- **0.1.0 jogável:** cidade 4 quarteirões, guerreiro 8 dirs (idle/walk/attack/death).
- Arte atual: **placeholders coloridos** (pipeline OpenAI pronto para sheets reais).
- Controles: **WASD/setas** · **Space** ataque · **K** morte (debug).

## Setup

```bash
cd /home/leandro/lecolt/jet/jet-village-2
cp .env.example .env   # OPENAI_API_KEY=…
npm run setup
```

## Rodar

```bash
npm run api    # :8787 — geração de assets
npm run dev    # :5173 — client (infra / depois cidade)
```

## Gerar asset

```bash
npm run assets:generate -- --kind flora --subject "oak tree" --name oak-01
```

## Skills

| Skill | Uso |
|-------|-----|
| `new-feature` | Versão: worktree → spec → ship → PR `develop` |
| `ship-feature` | Merge + limpar worktree |
| `generate-asset` | PNG via OpenAI |
| `new-prompt-kind` | Novo template |
| `learn` | Aprendizados permanentes |

## Git

- Branch base de features: **`develop`**.
- Worktrees: `../jet-village-2-<V>`.
- Bootstrap: commit inicial → criar `develop` → push antes das features.

## Docs

- [CLAUDE.md](CLAUDE.md) — regras do harness  
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)  
- [docs/PLANO.md](docs/PLANO.md)  
- [docs/specs/](docs/specs/)  
