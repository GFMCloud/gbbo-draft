// Validates data/season.json against data/bakers.json and prints the standings.
// Prints OK and exits 0 only when every check passes.
import { readFileSync } from "node:fs";
import { asList, score } from "../assets/scoring.js";

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const { bakers } = read("data/bakers.json");
const season = read("data/season.json");
const errors = [];
const fail = (msg) => errors.push(msg);

const ids = new Set();
for (const b of bakers) {
  if (!b.id || !b.name || !b.bio) fail(`baker missing id, name or bio: ${JSON.stringify(b.name || b.id)}`);
  if (ids.has(b.id)) fail(`duplicate baker id: ${b.id}`);
  ids.add(b.id);
}
const known = (id, where) => { if (!ids.has(id)) fail(`${where}: unknown baker id "${id}"`); };

const { graham, lauren } = season.teams;
if (graham.length || lauren.length) {
  for (const id of graham) known(id, "teams.graham");
  for (const id of lauren) known(id, "teams.lauren");
  const size = bakers.length / 2;
  if (graham.length !== size || lauren.length !== size) fail(`each team needs ${size} bakers (graham ${graham.length}, lauren ${lauren.length})`);
  const both = graham.filter((id) => lauren.includes(id));
  if (both.length) fail(`on both teams: ${both.join(", ")}`);
  for (const [team, list] of [["graham", graham], ["lauren", lauren]]) {
    if (new Set(list).size !== list.length) fail(`a baker appears twice on ${team}'s team`);
  }
  for (const p of season.draft.order) {
    if (!season.teams[p.team]?.includes(p.baker)) fail(`draft.order pick ${p.pick}: ${p.baker} is not on ${p.team}'s team`);
  }
}

const EVENT_KEYS = ["technical_winner", "technical_last", "star_baker", "handshakes", "eliminated", "finalists", "winner"];
for (const key of Object.keys(season.scoring)) {
  if (!EVENT_KEYS.includes(key) && key !== "survived") fail(`scoring key "${key}" is not a week field`);
}

const gone = new Map();
season.weeks.forEach((week, i) => {
  const where = `week ${week.week}`;
  if (week.week !== i + 1) fail(`weeks must run 1, 2, 3... in order; entry ${i + 1} is week ${week.week}`);
  if ("survived" in week) fail(`${where}: "survived" is computed from eliminations; remove it`);
  const winner = asList(week.winner);
  if (winner.length > 1) fail(`${where}: only one winner`);
  if (winner.length && !asList(week.finalists).includes(winner[0])) fail(`${where}: the winner must also be listed in finalists`);
  for (const key of EVENT_KEYS) {
    for (const id of asList(week[key])) {
      known(id, `${where} ${key}`);
      if (gone.has(id)) fail(`${where} ${key}: ${id} already went home in week ${gone.get(id)}`);
    }
  }
  for (const id of asList(week.eliminated)) gone.set(id, week.week);
});
if (season.weeks.filter((w) => asList(w.finalists).length).length > 1) fail("finalists may be set in one week only");

if (errors.length) {
  console.error(`FAILED (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const { weekPoints, totals } = score(season);
const last = weekPoints.at(-1);
if (last) console.log(`Week ${season.weeks.length} swing: Graham ${last.graham}, Lauren ${last.lauren}`);
console.log(`Totals: Graham ${totals.graham}, Lauren ${totals.lauren}`);
console.log("OK");
