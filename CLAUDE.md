# Jet Village 2 — Harness (MMORPG multiplayer-ready)

Jogo 2D top-down pixel art **cozy / adventure MMORPG**.  
Client: **TypeScript strict + Canvas 2D**, zero dependências de runtime no bundle do jogo.  
Assets de desenvolvimento: **prompts → FastAPI → OpenAI Images (`gpt-image-2`, quality high)**.  
**v0.1.0:** client local (1 player); netcode fica para versões seguintes — estado e sistemas já em dados puros / intent de input.

### Especificações

| Documento | Quando abrir |
| --------- | ------------ |
| `docs/ARCHITECTURE.md` | Stack, camadas, pipeline de assets, roadmap multiplayer |
| `docs/specs/<MAJOR>.<MINOR>.<PATCH>/<semver>.md` | **Delta** da versão (produto). Índice: `docs/specs/README.md` |
| `docs/PLANO.md` | Tasks e status |
| `docs/ESPECIFICACAO.md` | Base consolidada (após releases; pode não existir ainda) |

**Fluxo de versão:** (1) worktree + branch a partir de `develop`; (2) spec de produto **antes** do código; (3) aceite humano; (4) arch-spec + implementação; (5) gates → PR para `develop`.

## Estado do projeto

- **Infra:** Vite shell, API de assets OpenAI, templates `character|building|flora|path`.
- **Próxima feature:** `0.1.0` — cidade 4 quarteirões + guerreiro 8 dirs (walk/attack/death), arma desacoplada.
- **Fonte do estado:** `docs/PLANO.md`.

## Comandos

- `npm run dev` — Vite · `npm run build` — tsc + vite build
- `npm run api` — FastAPI asset service (`:8787`)
- `npm run assets:generate` — CLI → `POST /v1/generate`
- `npm run typecheck` — `tsc --noEmit`
- Futuro: `npm run test`, `architecture:check`, `playtest`, `check` / `check:full`

Ambiente: Node **≥ 20.19**. API Python: `.venv` + `api/requirements.txt`. Auth imagem: `OPENAI_API_KEY` no `.env` (nunca commitar).

## Regras invioláveis

1. **Camadas** (quando `src/` tiver código real): `core/` não importa `game/` nem `platform/`; `game/` → `core/`; `platform/` → `core/`; só `src/main.ts` junta. Gate: `tools/check-architecture.ts` (quando existir).
2. **Assets gerados:** não editar à mão `public/assets/generated/**` (hook bloqueia). Gerar via API / skill `generate-asset`. Assets **promovidos** (revisados) em `public/assets/{sprites,tiles,ui,maps}/`.
3. **Spec antes do código.** Mudança de comportamento → atualizar `docs/specs/<V>/` no mesmo commit.
4. **TS strict, sem `any`.** Código/commits em **inglês**; docs de produto e UI em **pt-BR**.
5. **Componentes = dados puros; sistemas = uma responsabilidade.** Input como **intent** (multiplayer-ready), não lógica misturada com DOM.
6. **URLs de assets** via `import.meta.env.BASE_URL` (subpath-safe).
7. **Cenas** com `AbortSignal` last-request-wins quando existir `SceneManager`.
8. **Não force-push** em `develop`. PR base: **`develop`**.
9. **Netcode fora da 0.1.0** — não abrir servidor/salas na mesma entrega da cidade.

## Pipeline de assets

```
Skill generate-asset / CLI
  → POST /v1/generate { kind, subject, name }
  → OpenAI gpt-image-2 (high)
  → public/assets/generated/<kind>/…
  → (humano/skill) promove para public/assets/sprites|tiles|…
```

Skills de arte: **`generate-asset`**, **`new-prompt-kind`**.  
Não usar pipeline procedural do Jet Village 1 (`tools/sprites`, paleta fechada obrigatória).

## Skills de versão

| Skill | Uso |
|-------|-----|
| `new-feature` | Worktree → spec → (aceite) → arch → ship → PR `develop` |
| `ship-feature` | Commit/push/PR/merge/limpar worktree |
| `learn` | Institucionalizar erros/procedimentos |
| `generate-asset` | PNG via OpenAI |
| `new-prompt-kind` | Novo template de prompt |

## Protocolo de custo

- Não ler specs inteiras sem necessidade; abrir só a seção.
- Teste focado no que mudou; gates completos ao fechar feature.
- Arte: **Read** do PNG gerado. Gameplay (quando existir): playtest no browser.
- Exploração ampla → subagente com escopo estreito.

## Auto-evolução

Invoque **`learn`** quando: ≥2 tentativas no mesmo erro; procedimento multi-passo pela 2ª vez; checagem barata teria evitado; usuário corrigiu o fluxo.

Histórico: `docs/APRENDIZADOS.md`. Máx. 10 itens em "Aprendizados ativos" abaixo.

## Aprendizados ativos

<!-- Máx. 10; skill learn -->

- **API de assets:** `OPENAI_API_KEY` no `.env` da raiz do v2; health em `GET :8787/health`.
- **`gh` / PR:** `GH_TOKEN` em `.env.local` do checkout principal (gitignored). Antes de `gh`: `set -a && . "$(dirname "$(git rev-parse --git-common-dir)")/.env.local" && set +a`.
