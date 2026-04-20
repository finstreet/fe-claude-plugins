---
name: new-feature-branch
description: Create a new git branch following the Conventional Branch naming convention.
disable-model-invocation: true
argument-hint: "[ticket] [description]"
---

# Create New Feature Branch

Create a new git branch following the [Conventional Branch](https://conventional-branch.github.io/#summary) naming convention.

## Branch Naming Convention

Branches must follow this pattern:

```
<type>/<ticket>-<description>
```

### Types

| Type       | Description                |
| ---------- | -------------------------- |
| `feature`  | New feature or enhancement |
| `bugfix`   | Bug fix (non-production)   |
| `hotfix`   | Critical production fix    |
| `release`  | Release preparation        |
| `docs`     | Documentation only         |
| `refactor` | Code refactoring           |
| `test`     | Adding or updating tests   |
| `chore`    | Maintenance tasks          |

### Ticket Number

- Format: `eb-XXXX` (e.g., `eb-1250`)
- **Always ask the user for the ticket number if not provided**
- If the user explicitly states there is no ticket (rare), use format: `<type>/<description>` without ticket

### Description

- Use kebab-case (lowercase with hyphens)
- Keep it short but descriptive (2-5 words)
- No special characters except hyphens

## Examples

- `feature/eb-1250-user-authentication`
- `bugfix/eb-1189-fix-login-redirect`
- `hotfix/eb-1300-critical-payment-fix`
- `refactor/eb-1275-cleanup-api-calls`
- `chore/update-dependencies` (no ticket - rare)

## Workflow

Execute these steps in order:

### 1. Gather Information

If arguments were provided via `$ARGUMENTS`, parse them for ticket number, type, and description.

Otherwise, ask the user for:

- **Branch type** (default: `feature`)
- **Ticket number** (required unless explicitly stated there is none)
- **Brief description** of what the branch is for

### 2. Prepare Local Repository

```bash
# Switch to dev branch
git checkout dev

# Pull latest changes
git pull origin dev
```

### 3. Create and Checkout New Branch

```bash
# Create and switch to new branch
git checkout -b <type>/<ticket>-<description>
```

### 4. Confirm Success

After creating the branch, confirm to the user:

- The branch name that was created
- That they are now on the new branch
- Remind them to push with `git push -u origin <branch-name>` when ready
