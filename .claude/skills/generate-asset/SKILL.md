---
name: generate-asset
description: Gera um asset pixel art do Jet Village 2 via FastAPI (OpenAI gpt-image-2 high). Use com kind+subject ou prompt livre; inspeciona o PNG gerado.
---

# Generate asset (OpenAI Images)

Pipeline: **skill → `POST /v1/generate` → OpenAI `gpt-image-2` (quality high) → `public/assets/generated/`**.

## Pré-requisitos

1. `OPENAI_API_KEY` no `.env` do projeto (`jet-village-2/.env`).
2. API no ar: `npm run api` (default `http://127.0.0.1:8787`).
3. Conferir: `GET /health` → `openai_key_configured: true`.

## Kinds (templates em `prompts/`)

| kind | template | default size |
|------|----------|----------------|
| `character` | `character_sheet.md` | 1024×1536 |
| `building` | `building.md` | 1024×1024 |
| `flora` | `flora.md` | 1024×1024 |
| `path` | `path_tile.md` | 1024×1024 |

## Passos

1. `GET http://127.0.0.1:8787/health` — abortar se key false ou API down.
2. Gerar:

```bash
npm run assets:generate -- \
  --kind flora \
  --subject "oak tree with small white flowers" \
  --name oak-01
```

Ou HTTP:

```bash
curl -s http://127.0.0.1:8787/v1/generate \
  -H 'Content-Type: application/json' \
  -d '{"kind":"building","subject":"cozy country cottage with red roof","name":"cottage-01"}'
```

3. **Read** o PNG em `image_path` (ou URL `/files/...`) e validar silhueta, estilo cozy, fundo transparente se possível.
4. Não editar assets à mão; iterar com novo `subject` / `extra` / generate.

## Escape hatch

Prompt cru (ignora template):

```bash
npm run assets:generate -- --prompt "..." --name custom-01
```

## Novo tipo de asset

Skill **`new-prompt-kind`**: cria `prompts/<file>.md` + registro em `api/kinds.py`.
