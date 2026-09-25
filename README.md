# Bake Off draft

Graham and Lauren's Great British Bake Off draft and points tracker for the 2026
series, served by GitHub Pages.

- `draft.html`: coin flip for first pick, then alternating picks until each has 6.
- `index.html`: both teams, totals and a card per week, computed from
  `data/season.json`.
- `data/bakers.json`: the lineup, with bios taken only from pre-premiere
  announcements.
- `scripts/check.mjs`: validates the data; run `node scripts/check.mjs`.

Results are added by the Claude chat attached to this repo; see `CLAUDE.md`.
