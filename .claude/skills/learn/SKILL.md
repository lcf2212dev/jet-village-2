---
name: learn
description: Sistema de auto-evolução do harness — transforma dificuldades, descobertas e repetições em aprendizado permanente (CLAUDE.md), skill nova ou hook. Use quando algo custou ≥2 tentativas, um erro se repetiu, um procedimento multi-passo foi executado pela 2ª vez, ou o usuário corrigiu a forma de trabalhar.
---

# /learn — institucionalizar um aprendizado

## 1. Destile

Escreva em 1–3 linhas: **causa raiz + solução/procedimento correto**.  
Se a causa raiz ainda é desconhecida, NÃO institucionalize — registre como _pergunta aberta_ em `docs/APRENDIZADOS.md` e siga em frente.

## 2. Classifique o destino (nesta ordem)

| Destino | Critério |
| ------- | -------- |
| **Hook** (`.claude/hooks/`) | Verificação objetiva, automática e barata (&lt;1 s) |
| **Skill** (`.claude/skills/`) | Procedimento multi-passo (≥3) que se repete |
| **CLAUDE.md** | Fato/regra curta para quase toda sessão |
| **Só registro** | Raro — só `docs/APRENDIZADOS.md` |

**Anti-inflação:** preferir atualizar skill/hook existente. "Aprendizados ativos" no CLAUDE.md: **máx. 10**.

## 3. Execute

- **Sempre:** entrada datada em `docs/APRENDIZADOS.md`.
- **Hook:** `.mjs` (stdin JSON; exit 2 = bloqueio) + `.claude/settings.json`.
- **Skill:** `SKILL.md` com `name` + `description` (gatilhos de quando usar).
- **CLAUDE.md:** uma linha em Aprendizados ativos.

## 4. Valide

- Hook: payload que bloqueia (exit 2) e que passa (exit 0).
- Skill: `description` contém as palavras-gatilho.
- Informe o usuário em 1 linha o que foi institucionalizado.
