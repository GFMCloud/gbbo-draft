# Bake Off draft: instructions for the repo chat

Graham and Lauren watch The Great British Bake Off on US Netflix, behind the UK
broadcast. This repo is their draft and points site on GitHub Pages. You keep
`data/season.json` up to date from Graham's messages.

## Never spoil

- Record only what Graham tells you. Never search the web for results, never fill in
  a week he has not reported, and never mention anything about episodes he has not
  described, even if you know it.
- Never edit `data/bakers.json` bios with anything learned from episodes.

## Draft summary message

It starts with `GBBO 2026 draft complete.` Write `draft.first_pick`, `draft.order`
(`[{ "pick": 1, "team": "lauren", "baker": "<id>" }, ...]`) and `teams.graham` /
`teams.lauren` as arrays of baker ids from `data/bakers.json`.

## Episode message

Usually pasted from the Log results page (`results.html`): it starts with
`GBBO 2026 week N results.` and ends with a `Data:` line holding the exact week object.
Append that object to `weeks` as given; the lines above it are the human-readable copy.
If `N` is not the next week number, ask before writing.

Otherwise Graham reports in plain words: technical winner, technical last, Star Baker,
handshakes, who went home. Append one object to `weeks`:

```json
{ "week": 1, "theme": "Cake", "technical_winner": "<id>", "technical_last": "<id>",
  "star_baker": ["<id>"], "handshakes": ["<id>"], "eliminated": ["<id>"] }
```

Lists allow joint Star Bakers, several handshakes (repeat an id for a baker who gets
more than one in an episode), or a double elimination. Use `[]`
when nothing happened. `eliminated` lists only bakers who are out of the competition for
good: sent home by the judges, or withdrawn permanently. A baker who misses an
episode and returns is not eliminated. Survival points are computed from `eliminated`; never store them.

For the final episode only, also add `"finalists": ["<id>", "<id>", "<id>"]` and
`"winner": "<id>"` (the winner is one of the finalists), with `"eliminated": []`. Map every name to an id in `data/bakers.json`; if a name does
not match exactly one baker, ask instead of guessing. Correct an earlier week by
editing it in place.

## Before committing

Run `node scripts/check.mjs`. It must print `OK`. Then reply with the week's point
swing and both totals it prints, commit `data/season.json` with a message like
`Week 3 results`, and push to `main`. The page updates about a minute after the push.

Points are computed by the page from `scoring`; never store totals.
