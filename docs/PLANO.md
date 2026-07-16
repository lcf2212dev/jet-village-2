# Plano — Jet Village 2

## Estado atual

| Item | Status |
|------|--------|
| Infra Vite + canvas bootstrap | Feito |
| FastAPI + OpenAI Images (`gpt-image-2` high) | Feito |
| Prompts `character` / `building` / `flora` / `path` | Feito |
| Skills `generate-asset`, `new-prompt-kind` | Feito |
| Harness CLAUDE + learn + new-feature + ship-feature | **Feito** |
| Spec **0.1.0** (cidade + guerreiro) | **Aprovada** |
| Core ECS / platform / cena cidade | **Feito** (0.1.0 jogável) |
| Spec **0.1.1** (tiles grama/calçada/pedra) | **Implementada** |
| Arte OpenAI nos tiles de chão | **Feito** (tileset city-ground) |
| Spec **0.1.2** (guerreiro walk/run/attack/sit/death × 8 dirs) | **Implementada** |
| Arte OpenAI no guerreiro | **Feito** (atlas `sprites/warrior`) |
| Netcode multiplayer | Fora da 0.1.x (roadmap 0.2+) |

## Próximos passos

1. Servidor multiplayer na 0.2.x.
2. Iterar arte do guerreiro se o grid IA precisar de retouch.

## Histórico

- **2026-07-15** — **0.1.2**: guerreiro OpenAI 8 dirs (idle/walk/run/attack/sit/death); Shift run · C sit; atlas promovido.
- **2026-07-15** — Spec **0.1.2** rascunho: guerreiro 8 dirs (walk/run/attack/sit/death + idle); branches antigas 0.1.2/0.1.3 ignoradas.
- **2026-07-15** — **0.1.1**: tiles grama/calçada/pedra via OpenAI + tileset aplicado no ground.
- **2026-07-15** — Projeto criado; pipeline de assets OpenAI; harness Fase 0; 0.1.0 jogável.
