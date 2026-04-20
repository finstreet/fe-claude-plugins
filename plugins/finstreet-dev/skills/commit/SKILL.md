---
name: commit
description: Review, stage, commit, and push all current changes to remote.
disable-model-invocation: true
---

# Commit & Push

Review, stage, commit, and push the current changes.

## Workflow

Execute these steps in order.

### 1. Review All Changes

```bash
git status
git diff
git diff --staged
```

Before committing, check for:

- **Nothing to commit** — if `git status` shows a clean tree, stop and tell the user.
- **Debug statements** (e.g. `console.log`, `dbg!`, stray `print` calls) added during the session
- **Commented-out code** that shouldn't ship
- **Secrets** — `.env`, keys, tokens, passwords
- **Unintended files** — editor backups, large binaries, scratch dirs

If anything is suspicious, stop and ask the user before proceeding.

### 2. Stage Specific Files

Prefer explicit paths over `git add .` or `git add -A` — blanket staging can silently pick up `.env` files, local scratch work, or other unintended files.

```bash
git add <path1> <path2> ...
```

If every tracked change is in-scope and there are no risky untracked files, `git add .` is fine — but only after you've looked at `git status` and confirmed.

### 3. Write the Commit Message

**Format:**

```
<ticket>: <summary>

- What changed and why
- Group related changes
- Focus on intent, not mechanics
```

**Guidelines:**

- **Ticket is optional.** Extract a ticket from the branch name if one is present (e.g. `feature/eb-1250-...` → `EB-1250: <summary>`). If the branch has no ticket, skip the prefix and write `<summary>` directly.
- Summary ≤ 72 characters, imperative mood ("Add X" not "Added X")
- Bullet points explain the *why* when it isn't obvious from the diff

**Examples:**

With a ticket:
```
EB-1250: Add user authentication flow

- Implement login form with email/password validation
- Add JWT token handling in auth service
- Create protected route wrapper component
```

Without a ticket:
```
Replace hardcoded base branch with git auto-detection

- Read origin/HEAD to pick the trunk branch at runtime
- Fall back to probing dev/main/master locally
```

### 4. Commit

For multi-line messages, use a HEREDOC so quoting is safe:

```bash
git commit -m "$(cat <<'EOF'
<summary line>

- <bullet>
- <bullet>
EOF
)"
```

**If a pre-commit hook fails:** the commit did NOT happen. Fix the issue, re-stage, and create a **new** commit. Never use `--amend` here — there is no previous commit from this run to amend; `--amend` would modify the commit that came before.

### 5. Push

```bash
git push -u origin "$(git branch --show-current)"
```

The `-u` flag is harmless if the upstream is already set — it only sets tracking on first push.

### 6. Confirm

Report to the user:

- The commit hash and summary line
- The branch name and that the push succeeded
