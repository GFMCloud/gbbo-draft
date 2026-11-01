# Bake Off draft

Graham and Lauren's Great British Bake Off draft and points site for the 2026 series, on GitHub Pages.
Your job is usually to keep `data/season.json` current from Graham's messages. This repo is public.

- **Never spoil:** record only what Graham tells you. They watch behind the UK broadcast, so never search
  for results, fill in an unreported week, or mention episodes he hasn't described.
- **Before writing:** run `git pull --ff-only origin main`, since weeks are also recorded from other sessions.
- **Week messages:** a pasted `GBBO 2026 week N results.` message ends with a `Data:` line. Append that
  object to `weeks` as given. If `N` isn't the next week, ask. If a name doesn't match one baker in
  `data/bakers.json`, ask.
- **Eliminated:** only bakers out for good. Never store survival points or totals; the page computes them.
- **Final episode:** also add `finalists` and `winner`, with `eliminated` empty.
- **Check:** `node scripts/check.mjs` must print `OK`. Reply with the week's swing and both totals it prints.
- The page updates about a minute after a push to `main`.
