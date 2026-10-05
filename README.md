# Squash Guard

Browser extension (Chrome & Firefox) that disables **"Squash and merge"** on GitHub pull
requests whose base branch is on your protected list (default: `qa`, `staging`, `main`).

GitHub's linear-history setting can block merge commits, but there is no simple built-in way
to block only squash merging on selected branches. This fills that gap in the browser UI.

> This is a UI guard, not server-side enforcement. It does not stop merges made via the
> GitHub API, CLI, or another browser.

## Settings
Open the extension's Options page:
- **Protected branches**: comma-separated, e.g. `qa, staging, main`
- **GitHub orgs / repos**: comma-separated, `org` or `org/repo`. Empty = all repositories.

## Install from source
**Chrome:** `chrome://extensions` → Developer mode → Load unpacked → select this folder.

**Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`.

## Build a store package
```sh
zip -r squash-guard.zip manifest.json content.js options.html options.js icons
```

## Privacy
See [PRIVACY.md](PRIVACY.md). No data is collected.

## License
[MIT](LICENSE)
