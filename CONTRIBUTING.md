# Contributing

This repo bundles the Claude Code plugins Finstreet teams share. Adding or improving a skill means the whole team gets the upgrade on their next `/plugin update`.

## Repo layout

```
.
├── .claude-plugin/
│   └── marketplace.json          # marketplace catalog (plugin list + versions)
└── plugins/
    ├── finstreet-fe/              # frontend-specific plugin
    │   ├── .claude-plugin/plugin.json
    │   ├── .mcp.json              # finstreet-mcp server
    │   ├── hooks/hooks.json
    │   └── skills/<name>/SKILL.md
    └── finstreet-dev/             # generic developer workflow plugin
        ├── .claude-plugin/plugin.json
        └── skills/<name>/SKILL.md
```

See the [Claude Code plugin docs](https://code.claude.com/docs/en/plugins) for the canonical structure.

## Which plugin does my skill belong in?

- **`finstreet-fe`** — anything that depends on the Finstreet frontend stack (`@finstreet/forms`, `@finstreet/ui`, `@finstreet/secure-fetch`, the Next.js boilerplate, the Frontend MCP).
- **`finstreet-dev`** — generic developer tooling that works in any repo (git workflow, release helpers, language-agnostic linting, etc.).

When in doubt, start in `finstreet-dev`. Move to `finstreet-fe` only when the skill genuinely needs the frontend context.

## Local development

Point Claude Code at the plugin you're editing:

```bash
claude --plugin-dir ./plugins/finstreet-fe
# or
claude --plugin-dir ./plugins/finstreet-dev
```

You can pass `--plugin-dir` multiple times to load both at once. The local copy takes precedence over any installed marketplace version, so you can iterate without uninstalling. After editing a skill, run `/reload-plugins` in the session to pick up changes.

## Adding a skill

1. Create `plugins/<plugin-name>/skills/<kebab-name>/SKILL.md`.
2. Start with this frontmatter:
   ```markdown
   ---
   name: <kebab-name>
   description: "One sentence on what this skill does and when Claude should use it. Mention the trigger keywords a user is likely to say."
   user-invocable: true
   ---
   ```
3. Write the body as instructions for Claude — concrete steps, file templates, required ordering. Aim for a guide Claude can follow without needing to guess.
4. If the skill needs supporting reference material, add sibling `.md` files in the same directory and link to them from `SKILL.md`.
5. Test locally (see above). Invoke it via `/<plugin-name>:<kebab-name>` and confirm it behaves as expected.

## Skill invocation convention

All skills are namespaced under their plugin: `/finstreet-fe:<name>` or `/finstreet-dev:<name>`. When one skill triggers another, always use the full namespaced name — including across plugins (e.g. `finstreet-fe`'s `kickoff` referencing `/finstreet-dev:commit`).

## Evaluations

Skills that produce code (`form`, `page`, `list-actions`, etc.) can be exercised against golden outputs using eval workspaces. Eval workspaces live at the repo root (e.g. `form-workspace/`, `page-workspace/`) and are gitignored — they contain run artifacts, not source.

Workspace conventions are documented in [`CLAUDE.md`](./CLAUDE.md). In short: agents write outputs under `<workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/` matching the directory structure specified in the eval prompt.

## Releasing

1. Bump the `version` field of the plugin(s) you changed in `.claude-plugin/marketplace.json` using [semver](https://semver.org):
   - `PATCH` for skill content tweaks and bug fixes
   - `MINOR` for new skills or additive changes
   - `MAJOR` for breaking changes (skill renames, removed skills, changed invocation contracts)
   Each plugin has its own version — bump only the ones you touched.
2. Update the Changelog section in `README.md`.
3. Merge to `main`.
4. Team members run `/plugin marketplace update finstreet-plugins` followed by `/plugin update <plugin>@finstreet-plugins` for each plugin they want to update.

The version lives only in `marketplace.json` — not in each `plugin.json` — per the [docs guidance for relative-path plugins](https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels).

## Validating changes

Before merging, run:

```bash
claude plugin validate .
```

This catches JSON schema errors in `marketplace.json` and each `plugin.json`, malformed skill frontmatter, and `hooks/hooks.json` issues.
