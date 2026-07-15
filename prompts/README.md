# Prompt templates

Fonte da verdade do **estilo visual** do Jet Village 2.  
A API monta o prompt final: template + `{{subject}}` (+ `{{extra}}` opcional).

| kind | arquivo | uso |
|------|---------|-----|
| `character` | `character_sheet.md` | spritesheet animado |
| `building` | `building.md` | casas / construções |
| `flora` | `flora.md` | árvores, arbustos, plantas |
| `path` | `path_tile.md` | trilhas / floors |

## Placeholders

- `{{subject}}` — descrição do asset (obrigatório na API com `kind`)
- `{{extra}}` — notas pontuais (opcional)

## Exemplo

```bash
curl -s http://127.0.0.1:8787/v1/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "kind": "flora",
    "subject": "oak tree with small white flowers",
    "name": "oak-01"
  }'
```

Para um tipo novo, use a skill `new-prompt-kind` (template + registro em `api/kinds.py`).
