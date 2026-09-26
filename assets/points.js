import { TEAMS, loadJSON, el, avatar } from "./common.js";
import { asList, ownerOf, score, survivors } from "./scoring.js";

const app = document.getElementById("app");

// Week fields shown on each week card, in display order. Finale rows show only when set.
const EVENTS = [
  { key: "star_baker", label: "Star Baker" },
  { key: "handshakes", label: "Handshake" },
  { key: "technical_winner", label: "Technical win" },
  { key: "technical_last", label: "Technical last" },
  { key: "eliminated", label: "Went home" },
  { key: "finalists", label: "Reached the final", finale: true },
  { key: "winner", label: "Won the series", finale: true },
];
const LABELS = { ...Object.fromEntries(EVENTS.map((e) => [e.key, e.label])), survived: "Each week survived" };

function eliminatedWeek(season, id) {
  const week = season.weeks.find((w) => asList(w.eliminated).includes(id));
  return week ? week.week : null;
}

function render(bakers, season) {
  const byId = Object.fromEntries(bakers.map((b) => [b.id, b]));
  if (!season.teams.graham.length && !season.teams.lauren.length) {
    app.replaceChildren(el("div", { class: "panel empty" },
      el("h2", {}, "No teams yet"),
      el("p", {}, "The draft hasn't happened. ", el("a", { href: "draft.html" }, "Go to the draft"), "."),
    ));
    return;
  }

  const { points, weekPoints, totals } = score(season);
  const diff = totals.graham - totals.lauren;
  const lead = diff === 0 ? "All square" : `${diff > 0 ? "Graham" : "Lauren"} leads by ${Math.abs(diff)}`;
  const weeksLabel = season.weeks.length === 1 ? "1 week scored" : `${season.weeks.length} weeks scored`;

  const scoreboard = el("section", { class: "scoreboard", "aria-label": "Totals" },
    ["graham", "lauren"].map((team) => el("div", { class: `score team-${team}` },
      el("div", { class: "who" }, TEAMS[team].name),
      el("div", { class: "total" }, totals[team]),
      el("div", { class: "lead" }, team === "graham" ? lead : weeksLabel),
    )),
  );

  const teams = el("section", { class: "teams" },
    ["graham", "lauren"].map((team) => {
      const rows = [...season.teams[team]].sort((a, b) => (points[b] || 0) - (points[a] || 0));
      return el("div", { class: `panel team team-${team}` },
        el("h2", {}, `${TEAMS[team].name}'s bakers`),
        rows.map((id) => {
          const b = byId[id] || { id, name: id };
          const outWeek = eliminatedWeek(season, id);
          return el("div", { class: `team-row${outWeek ? " out" : ""}` },
            avatar(b),
            el("div", {},
              el("div", { class: "name" }, b.name),
              el("div", { class: "status" }, outWeek ? `Went home in week ${outWeek}` : "Still baking"),
            ),
            el("div", { class: "pts" }, points[id] || 0),
          );
        }),
      );
    }),
  );

  const weekCards = season.weeks
    .map((week, i) => ({ week, swing: weekPoints[i], stillIn: survivors(season, i).length }))
    .reverse()
    .map(({ week, swing, stillIn }) => el("article", { class: "panel week" },
      el("h3", {}, `Week ${week.week}${week.theme ? `: ${week.theme}` : ""}`),
      el("dl", {},
        EVENTS.filter(({ key, finale }) => !finale || asList(week[key]).length).flatMap(({ key, label }) => {
          const ids = asList(week[key]);
          const value = season.scoring[key];
          const suffix = value ? ` (${value > 0 ? "+" : ""}${value})` : "";
          return [
            el("dt", {}, label + suffix),
            el("dd", {}, ids.length
              ? ids.map((id) => {
                  const team = ownerOf(season, id);
                  return el("span", { class: `chip${team ? ` team-${team}` : ""}` }, byId[id]?.name || id);
                })
              : el("span", { class: "muted" }, "None")),
          ];
        }),
        season.scoring.survived ? [
          el("dt", {}, `Survived (${fmt(season.scoring.survived)} each)`),
          el("dd", {}, `${stillIn} bakers still in`),
        ] : [],
      ),
      el("div", { class: "swing" }, `This week: Graham ${fmt(swing.graham)}, Lauren ${fmt(swing.lauren)}`),
    ));

  const scoringNote = el("p", { class: "muted" },
    "Scoring: ",
    Object.entries(season.scoring)
      .map(([key, v]) => `${LABELS[key] || key} ${fmt(v)}`)
      .join(", "),
    ".",
  );

  app.replaceChildren(
    scoreboard,
    teams,
    el("h2", { style: "margin: 8px 0 12px" }, "Week by week"),
    weekCards.length ? el("section", { class: "weeks" }, weekCards) : el("p", { class: "muted" }, "No episodes scored yet."),
    scoringNote,
  );
}

const fmt = (n) => (n > 0 ? `+${n}` : `${n}`);

async function init() {
  try {
    const [bakerData, season] = await Promise.all([loadJSON("data/bakers.json"), loadJSON("data/season.json")]);
    render(bakerData.bakers, season);
  } catch (err) {
    app.replaceChildren(el("p", { class: "panel" }, `Something went wrong loading the scores: ${err.message}`));
  }
}

init();
