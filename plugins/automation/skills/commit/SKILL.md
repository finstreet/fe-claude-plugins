---
name: commit
description: Review, stage, commit, and push all current changes to remote.
disable-model-invocation: true
---

# Commit & Push

Review, stage, commit, and push all current changes.

## Workflow

Execute these steps in order:

### 1. Review All Changed Files

Before committing, thoroughly review all files in the changeset:

```bash
# View all changed files (staged and unstaged)
git status

# View the actual changes
git diff
git diff --staged
```

**Important checks before committing:**
- **Scan for debug `console.log` statements** - List all found instances and ask the user if they should be removed
- Check for commented-out code that shouldn't be committed
- Verify no sensitive data (API keys, credentials, etc.) is included
- Ensure no unintended files are being committed

If any issues are found, **stop and ask the user** before proceeding.

### 2. Stage All Changes

```bash
git add .
```

### 3. Write Commit Message

Analyze the changes to write a **comprehensive yet concise** commit message:

**Format:**
```
<ticket>: <Short summary of changes>

- Bullet point for each significant change
- Group related changes together
- Focus on WHAT changed and WHY
```

**Guidelines:**
- Extract the ticket number from the branch name (e.g., `feature/eb-1250-...` → `EB-1250`)
- Summary line should be max 72 characters
- Use imperative mood ("Add feature" not "Added feature")
- Be specific but concise in bullet points

**Example:**
```
EB-1250: Add user authentication flow

- Implement login form with email/password validation
- Add JWT token handling in auth service
- Create protected route wrapper component
- Update navigation to show user state
```

### 4. Commit Changes

```bash
git commit -m "<commit message>"
```

### 5. Push to Remote

```bash
# Push and set upstream if first push
git push -u origin $(git branch --show-current)
```

### 6. Confirm Success

After pushing, confirm the push was successful and show the current branch name.
