#!/usr/bin/env bash
# One-time setup: use your GitHub profile picture as the site avatar.
# Run from the repo root:  bash scripts/set-avatar.sh [github-username]
set -euo pipefail
user="${1:-HrithikSawant}"
mkdir -p assets/img
curl -fsSL "https://github.com/${user}.png?size=400" -o assets/img/avatar.jpg
[ "$(wc -c < assets/img/avatar.jpg)" -gt 1000 ] || { echo "Download looks wrong; check the username." >&2; rm -f assets/img/avatar.jpg; exit 1; }
if grep -q '^avatar:' _config.yml; then
  sed -i 's|^avatar:.*|avatar: /assets/img/avatar.jpg|' _config.yml
else
  sed -i '0,/^baseurl:.*/s||&\n\navatar: /assets/img/avatar.jpg|' _config.yml
fi
echo "Avatar saved to assets/img/avatar.jpg and _config.yml updated. Review with git diff, then commit."
