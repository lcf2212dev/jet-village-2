# Aprendizados — Jet Village 2

Histórico datado (skill `learn`). Entradas recentes também podem aparecer resumidas em `CLAUDE.md` (máx. 10 ativos).

---

## 2026-07-15 — OpenAI Images sem Hermes

- **Contexto:** geração de assets passou de Hermes/Sol para API OpenAI direta.
- **Aprendizado:** FastAPI + `gpt-image-2` quality high é o caminho determinístico de integração; OAuth Hermes não é necessário para o pipeline de PNG.
- **Onde:** `api/openai_client.py`, `.env` (`OPENAI_API_KEY`).
