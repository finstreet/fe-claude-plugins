# Finstreet Claude Code Plugins

Marketplace of [Claude Code plugins](https://code.claude.com/docs/en/plugins) maintained by Finstreet teams. New plugins can be added over time — this repo is designed to host more than the frontend.

## Plugins

| Plugin | Scope | README |
|---|---|---|
| [`finstreet-fe`](./plugins/finstreet-fe/README.md) | Skills for building Finstreet frontend features with `@finstreet/forms`, `@finstreet/ui`, and the Frontend MCP. | [details](./plugins/finstreet-fe/README.md) |
| [`finstreet-dev`](./plugins/finstreet-dev/README.md) | Generic developer workflow skills (git branching, committing, pull requests). Works in any project. | [details](./plugins/finstreet-dev/README.md) |

Frontend developers typically install both. Non-frontend teams can install just `finstreet-dev`.

## Add the marketplace

```
/plugin marketplace add finstreet/claude-plugins
```

This registers the marketplace under the name `finstreet-plugins`. You only have to do this once per machine.

## Install a plugin

Each plugin has its own install command and setup. See the per-plugin READMEs above for details:

- [Install `finstreet-fe`](./plugins/finstreet-fe/README.md#install)
- [Install `finstreet-dev`](./plugins/finstreet-dev/README.md#install)

## Update

Refresh the marketplace catalog, then update each installed plugin:

```
/plugin marketplace update finstreet-plugins
/plugin update finstreet-fe@finstreet-plugins
/plugin update finstreet-dev@finstreet-plugins
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for repo layout, local development, adding skills, and the release process.
