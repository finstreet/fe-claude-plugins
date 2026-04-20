# Contributing

This plugin bundles the skills that Finstreet frontend developers share via Claude Code. Adding or improving a skill means the whole team gets the upgrade on their next `/plugin update`.

## Repo layout

```
.
├── .claude-plugin/
│   └── marketplace.json          # marketplace catalog (plugin list + version)
└── plugins/
    └── finstreet-fe/
        ├── .claude-plugin/
        │   └── plugin.json       # plugin manifest
        ├── .mcp.json             # finstreet-mcp server config
        ├── hooks/
        │   └── hooks.json        # notification hooks
        └── skills/
            └── <skill-name>/
                ├── SKILL.md      # required: frontmatter + instructions
                └── *.md          # optional supporting docs
```

See the [Claude Code plugin docs](https://code.claude.com/docs/en/plugins) for the canonical structure.

## Local development

Clone this repo and point Claude Code at the local plugin directory:

```bash
claude --plugin-dir ./plugins/finstreet-fe
```

The local copy takes precedence over any installed marketplace version, so you can iterate without uninstalling. After editing a skill, run `/reload-plugins` in the session to pick up changes.

## Adding a skill

1. Create `plugins/finstreet-fe/skills/<kebab-name>/SKILL.md`.
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
5. Test locally (see above). Invoke it via `/finstreet-fe:<kebab-name>` and confirm it behaves as expected.

## Skill invocation convention

All skills are namespaced under the plugin: `/finstreet-fe:<name>`. When one skill triggers another (e.g. `form` calling `path-resolver`), reference it by the full namespaced name so the behavior is consistent whether invoked manually or via automation.

## Evaluations

Skills that produce code (`form`, `page`, `list-actions`, etc.) can be exercised against golden outputs using eval workspaces. Eval workspaces live at the repo root (e.g. `form-workspace/`, `page-workspace/`) and are gitignored — they contain run artifacts, not source.

Workspace conventions are documented in [`CLAUDE.md`](./CLAUDE.md). In short: agents write outputs under `<workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/` matching the directory structure specified in the eval prompt.

## Releasing

1. Bump `plugins[0].version` in `.claude-plugin/marketplace.json` using [semver](https://semver.org):
   - `PATCH` for skill content tweaks and bug fixes
   - `MINOR` for new skills or additive changes
   - `MAJOR` for breaking changes (skill renames, removed skills, changed invocation contracts)
2. Update the Changelog section in `README.md`.
3. Merge to `main`.
4. Team members run `/plugin marketplace update finstreet-plugins` followed by `/plugin update finstreet-fe@finstreet-plugins`.

The version lives only in `marketplace.json` — not in `plugin.json` — per the [docs guidance for relative-path plugins](https://code.claude.com/docs/en/plugin-marketplaces#version-resolution-and-release-channels).

## Validating changes

Before merging, run:

```bash
claude plugin validate .
```

This catches JSON schema errors in `marketplace.json` and `plugin.json`, malformed skill frontmatter, and `hooks/hooks.json` issues.
