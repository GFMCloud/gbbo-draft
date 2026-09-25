# GBBO 2026 draft site: done criteria

Confirmed by Graham 2026-09-25. Verify finished work against this file.

## Decisions (2026-09-25)

- Hosting: GitHub Pages, public repo under GFMCloud ("public is fine").
- Draft happens on one screen, both people together ("one screen").
- Draft format: random pick for who goes first, then alternate turns until 6 each
  (Graham: "Alternate draft where we randomly picked who went first and then take
  turns going back and forth"). Snake draft considered and declined 2026-09-25
  ("Straight alternation for draft picks").
- Viewing: Netflix in the US, behind the UK broadcast.
- Spoiler scrub: Graham, verbatim: "I need you to REALLY scrub with 2 agents to ensure
  no spoilers leak into the draft page."
- Per-episode results come from Graham's chat to a Claude session attached to the repo,
  which edits the data file.

## Done when

- [x] Draft page live on GitHub Pages with all 12 bakers of the 2026 lineup, each with a
      photo and a short bio sourced only from pre-premiere announcement material.
      (Live 2026-09-25; 12 cards, 12 photos loaded, served bakers.json checksum equals
      the scrubbed commit.)
- [x] A random coin flip decides who picks first; picks alternate until each has 6.
- [ ] Finishing the draft produces a one-line summary that, pasted into the repo chat,
      fills both teams on the points page. (Summary verified with test bakers; the paste
      into the repo chat is unproven until the first real draft.)
- [x] Points page shows both teams and totals computed from the data file, with a card
      per week (technical winner and loser, Star Baker, handshakes, eliminated).
- [x] Proven by a full test draft and one test episode with totals checked, then both
      cleared. (Test bakers, labelled as such, in the scratchpad; two test weeks scored
      Graham 8, Lauren 5, matching a hand count; check.mjs failed a planted bad file.)
- [x] Two independent agents scrub the live draft page (text, data file, photos, order,
      alt text, repo contents) and both return PASS with no spoiler found. (All 12 bios
      rewritten to one uniform template after round 1; round 2 on the pushed commit
      a5b8003: both PASS.)

## Open

- Scoring system: same as 2023 to 2025 (Star Baker +3, handshake +2, technical win +1,
  technical last -1) unless Graham adopts a change from the scoring research.

## Not this time

- The per-episode update routine beyond the data file it edits.
- Past seasons; a shared database for two phones.
