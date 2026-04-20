---
name: new-feature-branch
description: Create a new git branch following the Conventional Branch naming convention.
disable-model-invocation: true
argument-hint: "[ticket] [description]"
---

# Create New Feature Branch

Create a new git branch following the Conventional Branch naming convention. Branch naming rules are inlined below so the skill is self-contained.

## Branch Naming Convention

Branches must follow this pattern:

```
<type>/<ticket>-<description>
```

The ticket segment is Finstreet-specific (see below). Pure Conventional Branch uses `<type>/<description>`.

### Types

| Type       | Alias  | Description                         |
| ---------- | ------ | ----------------------------------- |
| `feature`  | `feat` | New feature or enhancement          |
| `bugfix`   | `fix`  | Bug fix (non-production)            |
| `hotfix`   | —      | Urgent production fix               |
| `release`  | —      | Release preparation                 |
| `docs`     | —      | Documentation only                  |
| `refactor` | —      | Code refactoring                    |
| `test`     | —      | Adding or updating tests            |
| `chore`    | —      | Maintenance, deps, tooling          |

Prefer the full names (`feature`, `bugfix`) over the aliases for consistency across the team.

### Trunk Branches (no prefix)

`main`, `master`, and `dev` are trunk branches and do not use a prefix. You never create these via this skill — you branch _off_ them.

### Ticket Number (optional)

Some Finstreet projects use tickets (e.g., `eb-XXXX` like `eb-1250`), others do not. The skill supports both:

- **If a ticket is provided** in `$ARGUMENTS` or by the user: include it as `<type>/<ticket>-<description>`. Use the ticket format the user provides — lowercase it and hyphenate if needed.
- **If no ticket is provided**: use `<type>/<description>` and proceed without asking. Do not block the flow.

The user will mention a ticket when they have one. Don't prompt for it.

### Description

- kebab-case: lowercase letters, digits, and hyphens only
- Short but descriptive (2–5 words)

## Naming Rules (strict)

Branch names must follow these rules or they will be rejected by CI:

- **Lowercase only** — no uppercase letters anywhere
- **Alphanumerics and hyphens** — `a-z`, `0-9`, `-`
- **No underscores, spaces, or special characters**
- **No consecutive hyphens** (`--`) or dots (`..`)
- **No leading or trailing hyphens or dots** in any segment
- **Dots allowed only** in `release/` version descriptions (e.g., `release/v1.2.0`)

### Invalid examples (do not produce these)

| Branch                        | Problem                        |
| ----------------------------- | ------------------------------ |
| `Feature/Add-Login`           | Uppercase letters              |
| `feature/new--login`          | Consecutive hyphens            |
| `feature/-new-login`          | Leading hyphen in description  |
| `release/v1.-2.0`             | Hyphen adjacent to dot         |
| `fix/header_bug`              | Underscore                     |
| `feature/eb-1250_add login`   | Underscore and space           |

### Valid examples

- `feature/eb-1250-user-authentication`
- `bugfix/eb-1189-fix-login-redirect`
- `hotfix/eb-1300-critical-payment-fix`
- `refactor/eb-1275-cleanup-api-calls`
- `release/v1.2.0`
- `chore/update-dependencies` (no ticket — rare)

## Workflow

Execute these steps in order:

### 1. Gather Information

If arguments were provided via `$ARGUMENTS`, parse them for ticket (if any), type, and description.

Otherwise, ask the user for:

- **Branch type** (default: `feature`)
- **Brief description** of what the branch is for

Do **not** ask for a ticket. The user will mention one if the project uses tickets.

Before proceeding, validate the assembled name against the **Naming Rules** above. If any rule fails, fix it silently (e.g. lowercase, replace underscores with hyphens).

### 2. Detect the Base Branch

Different repos use different trunk branches (`dev`, `main`, or `master`). Detect which one this repo uses:

```bash
# Prefer the remote's default branch when set
git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||'
```

If that returns nothing, fall back by checking which trunk branch exists locally, in priority order: `dev`, `main`, `master`:

```bash
for b in dev main master; do
  git show-ref --verify --quiet "refs/heads/$b" && echo "$b" && break
done
```

Use the detected branch name as `<base>` in the next step.

### 3. Prepare Local Repository

```bash
git checkout <base>
git pull origin <base>
```

### 4. Create and Checkout New Branch

```bash
git checkout -b <type>/<ticket>-<description>
# or, without ticket:
git checkout -b <type>/<description>
```

### 5. Confirm Success

After creating the branch, confirm to the user:

- The branch name that was created
- That they are now on the new branch
- Remind them to push with `git push -u origin <branch-name>` when ready
