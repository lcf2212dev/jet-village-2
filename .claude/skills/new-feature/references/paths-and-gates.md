# Paths and gates (new-feature) — Jet Village 2

## Canonical paths

| Artifact | Path |
| -------- | ---- |
| Product spec | `docs/specs/<V>/<V>.md` |
| Arch-spec | `docs/specs/<V>/<V>-arch.md` |
| Spec index | `docs/specs/README.md` |
| Task board | `docs/PLANO.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Consolidated base | `docs/ESPECIFICACAO.md` (when exists) |

## Language

| Surface | Language |
| ------- | -------- |
| Code, commits, PR technical | English |
| Product specs, PLANO, UI strings | pt-BR |
| Arch prose | pt-BR; APIs/code English |

## Worktree (sempre primeiro)

```bash
git fetch origin develop
git worktree add -b feature/<V>-<slug> ../jet-village-2-<V> origin/develop
cd ../jet-village-2-<V>
```

- Branch: `feature/<V>-<slug>` (kebab English).
- Worktree path: `../jet-village-2-<V>`.
- **Proibido** implementar feature no principal / `develop` local.
- PR base: **`develop`**.

Se o repo ainda não tiver `origin/develop` (bootstrap): criar commit inicial em `main`, branch `develop`, push, e só então worktrees.

## GitHub CLI auth

```bash
set -a
. "$(dirname "$(git rev-parse --git-common-dir)")/.env.local"
set +a
```

Nunca commitar `.env*`. Sem device-flow se `.env.local` existir.

## Gates por maturidade do repo

### Mínimo (infra / pré-ECS)

```bash
npm run typecheck
npm run build
# API opcional se a feature toca assets:
curl -s http://127.0.0.1:8787/health
```

### Com core portado

```bash
npm run typecheck
npm run architecture:check   # quando existir
npm run test                 # quando existir
npm run build
```

### Release com gameplay

```bash
npm run check:full           # quando existir
# + playtest-audit quando skill/tool existirem
```

## Asset audit (substitui new-sprite do v1)

1. Skill **`generate-asset`** (kind + subject) ou prompt livre.
2. API no ar + `OPENAI_API_KEY`.
3. **Read** do PNG em `public/assets/generated/…`.
4. Checklist: silhueta legível, estilo cozy top-down, fundo ok, sem texto/UI acidental.
5. Promover para `public/assets/{sprites,tiles,…}` só após revisão.

**Não** exigir `assets:check` byte-a-byte (OpenAI não é determinístico).
