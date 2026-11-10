# hrithiksawant.github.io

Personal site built with Jekyll and the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) theme.

## Publishing notes from Obsidian

1. In a note's frontmatter add `publish: true` (optional: `title`, `date`, `tags`, `categories`, `summary`).
2. Run `node scripts/sync-obsidian.mjs "/path/to/Vault"`. Add `--dry-run` to preview.
3. Review with `git status` and `git diff`, then commit and push. Pushing to `main` deploys the site.

Posts created by the script are marked `synced_from: obsidian` and are rebuilt on each run, so removing `publish: true` from a note removes its post. Posts written by hand are never touched.
