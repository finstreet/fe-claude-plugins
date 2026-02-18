---
name: pr
description: Create a pull request for the current branch against dev.
disable-model-invocation: true
---

# Create Pull Request

Create a pull request for the current branch. Run `/commit` first if you have uncommitted changes.

## Workflow

Execute these steps in order:

### 1. Pre-flight Checks

```bash
# Check for uncommitted changes
git status

# Check if a PR already exists for this branch
gh pr view --json url,title 2>/dev/null
```

- If there are **uncommitted changes**, tell the user to run `/commit` first and stop.
- If a **PR already exists**, show the existing PR URL and stop.

### 2. Gather Context

```bash
# Get all commits on this branch relative to dev
git log dev..HEAD --oneline
```

Use the full commit history to understand the scope of the PR.

### 3. Create Pull Request

```bash
gh pr create --base dev --title "<PR title>" --body "<PR body>"
```

**PR Title:** Use the ticket + summary format (e.g., `EB-1250: Add user authentication flow`).
Extract the ticket number from the branch name (e.g., `feature/eb-1250-...` → `EB-1250`).

**PR Body Template:**
```markdown
## Summary
<Brief description of what this PR accomplishes>

## Changes
- <List of key changes derived from commit history>

## Testing
- <How was this tested?>
- <Any specific areas to review?>

## Ticket
<Link to ticket if applicable>
```

### 4. Confirm Success

After creating the PR:
- Provide the PR URL to the user
- Mention the target branch (dev)
