---
name: new-prompt-kind
description: Adiciona um novo kind de prompt de asset (template em prompts/ + registro em api/kinds.py) no Jet Village 2.
---

# New prompt kind

Use quando surgir um tipo de asset que não é `character | building | flora | path` (ex.: UI, item, weapon).

## Passos

1. Criar `prompts/<name>.md` self-contained:
   - Frontmatter opcional: `kind`, `default_size`, `default_quality`
   - Corpo com `{{subject}}` e opcional `{{extra}}`
   - Estilo cozy pixel art top-down / 3/4, negative prompt, fundo transparente quando fizer sentido
2. Registrar em `api/kinds.py` dentro de `KINDS`:

```python
"item": KindSpec(
    kind="item",
    template="item.md",
    default_size="1024x1024",
    description="Inventory / world item icon",
),
```

3. Atualizar `AssetKind` em `api/schemas.py` se o Literal for restrito.
4. Documentar uma linha em `prompts/README.md` e na skill `generate-asset`.
5. Smoke: `GET /v1/kinds` lista o novo kind; generate de teste com subject curto.

## Não fazer

- Embutir prompts longos na skill (ficam só em `prompts/`).
- Commitar `.env` ou PNGs de teste em massa sem revisão.
