---
name: release
description: "Cut a new release for one or more plugins in this marketplace: bump version in marketplace.json, add a Changelog entry, commit on main, and push. Trigger on 'release', 'cut a release', 'bump version', 'publish plugin update'."
disable-model-invocation: true
---

# Release

Cut a new release for any plugins that have changed since the last release. Bumps `version` in `.claude-plugin/marketplace.json`, prepends a Changelog entry to the plugin's README, commits on `main`, and pushes.

This skill is local to this repo. It assumes the workflow here: commits land directly on `main`, no feature branches, no tags.

## Workflow

Execute these steps in order. Stop and report to the user at any step that fails a check.

### 1. Pre-flight

```bash
git status --porcelain
git branch --show-current
git fetch origin main
git rev-list --left-right --count origin/main...HEAD
```

Abort with a clear message if:

- Working tree is not clean (`git status --porcelain` is non-empty) — tell the user to commit or stash first.
- Current branch is not `main`.
- Local and `origin/main` have diverged (left or right count is non-zero). If local is behind, ask the user to pull. If local is ahead, that's expected — those are the commits we're about to release.

### 2. Find the last-release boundary

`marketplace.json` is only edited during releases, so the SHA of the last commit that touched it is the boundary.

```bash
git log -1 --format=%H -- .claude-plugin/marketplace.json
```

Call this SHA `<base>`. If the command returns nothing (shouldn't happen in this repo), fall back to the repo's initial commit: `git rev-list --max-parents=0 HEAD`.

### 3. Detect changed plugins

Read the list of plugin names from `.claude-plugin/marketplace.json` (the `plugins[].name` entries). For each plugin:

```bash
git log <base>..HEAD --oneline -- plugins/<name>/
```

- If the output is empty, the plugin has no changes — skip it.
- Otherwise, record the commit list for that plugin.

If **no** plugin has changes, tell the user "nothing to release since `<base-short-sha>`" and stop.

### 4. Per changed plugin — propose a minor bump

For each plugin with changes, show the user:

- The plugin name and its current version (from `marketplace.json`).
- The commit list from step 3 (`<short-sha> <subject>` lines).
- The proposed new version — always a **minor** bump by default (`X.Y.Z` → `X.(Y+1).0`). The skills here are still being iterated on, so semver is not being followed strictly.

The user can override by explicitly asking for `patch`, `major`, or `skip` for a given plugin. Don't ask unless they push back or proactively specify — just apply the minor bump and move on.

Compute the new version from the current `version` string (semver `MAJOR.MINOR.PATCH`):

- `patch` → `X.Y.(Z+1)`
- `minor` → `X.(Y+1).0` ← default
- `major` → `(X+1).0.0`

If the user picks `skip` for a plugin, drop it from the release set. If every plugin is skipped, stop.

### 5. Apply edits

Use the `Edit` tool for both files — never sed, never shell heredoc.

#### 5a. Bump `version` in `.claude-plugin/marketplace.json`

Update the `version` field inside the plugin's object. Match enough surrounding context that the Edit is unambiguous (the plugin name on a nearby line, for instance).

#### 5b. Prepend a Changelog entry in `plugins/<name>/README.md`

Insert a new `### X.Y.Z` block directly below the `## Changelog` heading, above the previous entry. Match the existing format — bullet points, past-tense imperative ("Add X", "Fix Y"), no trailing blank lines between bullets.

Derive bullets from the commit subjects:

- One bullet per commit is usually right. Merge near-duplicates.
- Trim ticket prefixes (e.g. `EB-1250: `) so the bullet reads as user-facing changelog text.
- Drop purely-mechanical commits ("fix typo", "reformat") unless they're all there is.

Example result (style only):

```markdown
## Changelog

### 1.0.1
- Harden the commit skill against accidental `.env` staging.
- Clarify when to use HEREDOC in commit messages.

### 1.0.0
- Extracted from the `finstreet-fe` plugin...
```

### 6. Validate

```bash
claude plugin validate .
```

If validation fails, show the error to the user and stop. Do **not** commit.

### 7. Commit on main

Stage only the files that were edited. Never `git add .` or `git add -A`.

```bash
git add .claude-plugin/marketplace.json plugins/<name>/README.md [plugins/<other>/README.md ...]
```

Commit message format — **single plugin**:

```
Release <plugin> <new-version>

- <bullet matching the changelog>
- <...>
```

**Multi-plugin** release (one commit, listing each plugin):

```
Release <pluginA> <vA>, <pluginB> <vB>

<pluginA> <vA>:
- <...>

<pluginB> <vB>:
- <...>
```

Use a HEREDOC so multi-line bodies and special characters are safe (same pattern as the commit skill at `plugins/finstreet-dev/skills/commit/SKILL.md`):

```bash
git commit -m "$(cat <<'EOF'
Release finstreet-dev 1.0.1

- <bullet>
- <bullet>
EOF
)"
```

If a pre-commit hook fails: the commit did NOT happen. Fix the issue, re-stage, and create a **new** commit. Never `--amend`.

### 8. Push (with confirmation)

Pushing to `main` is shared state. Show the user exactly what will be pushed and wait for confirmation:

```bash
git log -1 --format="%h %s" HEAD
```

Then push:

```bash
git push origin main
```

### 9. Report

Tell the user:

- The commit hash and release summary line.
- Each plugin that was released and its new version.
- The team-facing update commands they can share (from `CONTRIBUTING.md` §Releasing):
  ```
  /plugin marketplace update finstreet-plugins
  /plugin update <plugin>@finstreet-plugins
  ```

## Notes

- The skill uses commits-under-`plugins/<name>/` as the change signal. Changes that only touch root-level files (e.g. `README.md`, `CONTRIBUTING.md`, `.claude/`) do not trigger a release for any plugin — that's intentional.
- First-run behaviour: because this repo's very first commit already created `marketplace.json`, `<base>` will always resolve to a real SHA. No tag bootstrapping is needed.
