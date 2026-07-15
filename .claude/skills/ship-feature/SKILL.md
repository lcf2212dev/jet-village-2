---
name: ship-feature
description: >
  Fecha feature branch/worktree do Jet Village 2: commit se houver mudanças,
  push, PR para develop, merge, pull no principal, remover worktree e branch local.
  Use when: /ship-feature, "ship feature", "fecha a feature", "merge e limpa worktree".
---

# ship-feature — Jet Village 2

Complemento de `new-feature` (modo B).

## Pré-condições

- Gates ok (mínimo `typecheck` + `build`; `check:full` quando existir).
- cwd = **worktree da feature** (não `develop` do principal).
- `GH_TOKEN` em `.env.local` do principal.

## Passos

### 0. Contexto

```bash
git rev-parse --show-toplevel
git branch --show-current
git status
git worktree list
```

### 1. Commit (se sujo)

```bash
git add <paths explícitos>   # nunca .env*
git commit -m "feat(area): short English summary"
```

### 2. Push

```bash
git push -u origin HEAD
```

### 3. PR

```bash
set -a && . "$(dirname "$(git rev-parse --git-common-dir)")/.env.local" && set +a
gh pr create --base develop --title "feat: <V> — …" --body "…"
```

### 4. Merge (só com pedido explícito)

```bash
gh pr merge <N> --merge --delete-branch
```

### 5. Pull no principal

```bash
MAIN="$(dirname "$(git rev-parse --git-common-dir)")"
cd "$MAIN" && git checkout develop && git pull origin develop
```

### 6. Remover worktree

```bash
git worktree remove /path/jet-village-2-<V>
git branch -d feature/<V>-<slug> 2>/dev/null || true
```

Sem `--force` em worktree suja sem confirmação.

## Anti-padrões

- Commit na `develop` do principal “para ir mais rápido”.
- PR para `main`.
- Device-flow com `.env.local` presente.
- Force-push em `develop`.
