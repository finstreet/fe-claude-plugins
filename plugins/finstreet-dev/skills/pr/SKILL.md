---
name: pr
description: Create a pull request for the current branch against the repo's trunk branch.
disable-model-invocation: true
---

# Create Pull Request

Create a pull request for the current branch against the repo's trunk branch (auto-detected). Run `/finstreet-dev:commit` first if you have uncommitted changes.

## Workflow

Execute these steps in order.

### 1. Pre-flight Checks

```bash
git status
gh pr view --json url,title 2>/dev/null
```

- If `git status` shows **uncommitted changes**, tell the user to run `/finstreet-dev:commit` first and stop.
- If `gh pr view` returns a JSON object (not an error), a **PR already exists** — show the URL and stop.

### 2. Detect the Base Branch

Different repos use different trunk branches (`dev`, `main`, `master`). Detect which one this repo uses:

```bash
git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||'
```

If that returns nothing, fall back by checking which trunk branch exists, in priority order: `dev`, `main`, `master`:

```bash
for b in dev main master; do
  git show-ref --verify --quiet "refs/heads/$b" && echo "$b" && break
done
```

Use the detected value as `<base>` in the following steps.

### 3. Ensure the Branch Is Pushed

`gh pr create` requires the branch to exist on the remote. If it's never been pushed, push first:

```bash
git push -u origin "$(git branch --show-current)"
```

### 4. Gather Context

```bash
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
```

Read every commit — the PR description should reflect the whole branch, not just the latest commit.

### 5. Build Title and Body

**Title:**

- If the branch name contains a ticket (e.g. `feature/eb-1250-...`), prefix it: `EB-1250: <summary>`.
- Otherwise, use a plain imperative summary derived from the commits.
- Keep it ≤ 70 characters.

**Body template:**

```markdown
## Summary
<One or two sentences on what this PR accomplishes and why>

## Changes
- <Key change derived from the commit history>
- <...>

## Testing
- <How was this tested, or what should the reviewer check>
```

Drop a section if it's not meaningful (e.g. no separate testing notes needed for a docs-only change). If there's a ticket, add a `## Ticket` section with a link when you have one — otherwise omit.

### 6. Create the Pull Request

Use a HEREDOC for the body so multi-line content and special characters don't break quoting:

```bash
gh pr create --base <base> --title "<title>" --body "$(cat <<'EOF'
## Summary
<...>

## Changes
- <...>

## Testing
- <...>
EOF
)"
```

Pass `--draft` if the user asked for a draft PR.

### 7. Confirm

Report to the user:

- The PR URL
- The target branch (`<base>`)
- Whether it's a draft
