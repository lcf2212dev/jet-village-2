---
name: new-feature
description: >
  Orquestra o ciclo de versão do Jet Village 2: worktree a partir de develop,
  spec de produto (docs/specs/X.Y.Z), gate humano, arch-spec, implementação,
  auditoria de assets via generate-asset, gates, commit EN e PR para develop.
  Use when: /new-feature, "nova feature", "nova versão", "ship version",
  "spec da versão", "implementar versão", ou descreve a próxima release.
---

# new-feature — Jet Village 2

Dois modos. **Não pule o gate humano.** Worktree **primeiro**.

| Modo | Quando | Até onde |
| ---- | ------ | -------- |
| **A — Spec** | Pedido / `/new-feature` sem “aceito” | Worktree → `docs/specs/<V>/<V>.md` → **PARA** |
| **B — Ship** | Usuário aceita a spec | Arch → build → assets (`generate-asset`) → gates → PR `develop` |

`<V>` = semver (ex. `0.1.0`). Detalhes de paths/gates: `references/paths-and-gates.md`.

## Regras invioláveis

1. Worktree a partir de `origin/develop` **antes** de spec/código.
2. Spec antes do código; mudança de comportamento → atualizar spec no mesmo commit.
3. Código/commits EN; docs/UI pt-BR.
4. Assets: skill **`generate-asset`** + Read PNG — **não** `new-sprite` do v1.
5. Camadas `core` / `game` / `platform` quando o código existir.
6. PR base **`develop`**. Sem force-push em `develop`.
7. Netcode só se a spec da versão pedir (não na 0.1.0).

## 0. Worktree

```bash
git fetch origin develop
git worktree add -b feature/<V>-<slug> ../jet-village-2-<V> origin/develop
cd ../jet-village-2-<V>
```

- Reutilizar worktree/branch correta se já existir.
- **Proibido** escrever a feature no principal.
- Bootstrap sem `origin/develop`: avisar usuário a criar/push `develop` primeiro.

## Modo A — Spec

1. Coletar motivação, escopo, fora de escopo.
2. Escrever `docs/specs/<V>/<V>.md` (status **Rascunho / Aguardando aprovação**):
   - Motivação, escopo (V1…), contratos, arte, aceite, fora de escopo, nota multiplayer se relevante.
3. Atualizar `docs/specs/README.md` e opcionalmente `docs/PLANO.md`.
4. **Parar:** reportar worktree, branch, path da spec; pedir **aprovar / mudanças**.

**Proibido no modo A:** arch final, código de jogo, commit de feature, PR.

## Modo B — Ship (após “aceito” / “implementa” / “go”)

1. Status da spec → **Aprovada**.
2. Escrever `docs/specs/<V>/<V>-arch.md` (DAG, ownership, APIs TS, DoD).
3. Waves de implementação sem overlap de arquivos.
4. Assets: `generate-asset` + Read; promover se ok.
5. Gates: ver `references/paths-and-gates.md` (proporcional à maturidade).
6. Commit EN + push + `gh pr create --base develop` (token de `.env.local` do principal).

Body do PR: Summary, Spec paths, Asset audit, Test plan.

## Checklist rápido

**Sempre:** fetch develop · worktree · cwd = worktree  

**A:** spec completa · README specs · stop para aprovação  

**B:** aceite · arch · waves · assets lidos · gates · PR develop  

## Anti-padrões

- Spec/código no principal sem worktree.
- Implementar antes do aceite.
- Usar geradores/paleta do Jet Village 1.
- PR para `main` (base é `develop`).
- Abrir multiplayer “de bônus” sem spec.
