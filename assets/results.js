import { TEAMS, loadJSON, el, avatar } from "./common.js";
import { ownerOf, survivors } from "./scoring.js";

const app = document.getElementById("app");
let bakers = [];
let season;
let weekNo = 1;
let state;

const storageKey = () => `gbbo-results-2026-week-${weekNo}`;
const blank = () => ({ theme: "", final: false, techWin: null, techLast: null, star: [], shakes: {}, home: [], finalists: [], winner: null });
const byId = (id) => bakers.find((b) => b.id === id);
const name = (id) => byId(id)?.name || id;

function save() {
  try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch {}
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey()));
    if (saved && typeof saved === "object") return { ...blank(), ...saved };
  } catch {}
  return blank();
}

const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

function act(fn) {
  fn();
  save();
  render();
}

function setTech(field, other, id) {
  state[field] = state[field] === id ? null : id;
  if (state[other] === id) state[other] = null;
}

// The week object the repo chat appends to data/season.json.
function weekData() {
  const handshakes = Object.entries(state.shakes).flatMap(([id, n]) => Array(n).fill(id));
  const week = {
    week: weekNo,
    ...(state.theme.trim() ? { theme: state.theme.trim() } : {}),
    technical_winner: state.techWin,
    technical_last: state.techLast,
    star_baker: state.final ? [] : state.star,
    handshakes,
    eliminated: state.final ? [] : state.home,
  };
  if (state.final) Object.assign(week, { finalists: state.finalists, winner: state.winner });
  return week;
}

function problems() {
  const list = [];
  if (!state.techWin) list.push("Pick the technical winner.");
  if (!state.techLast) list.push("Pick who came last in the technical.");
  if (state.final) {
    if (state.finalists.length < 2) list.push("Mark the finalists.");
    if (!state.winner) list.push("Pick the winner.");
  } else if (!state.star.length) {
    list.push("Pick Star Baker.");
  }
  return list;
}

function summaryText() {
  const w = weekData();
  const shakeCounts = Object.entries(state.shakes).map(([id, n]) => (n > 1 ? `${name(id)} x${n}` : name(id)));
  const lines = [
    `GBBO 2026 week ${weekNo} results.${w.theme ? ` Theme: ${w.theme}.` : ""}`,
    `Technical winner: ${name(w.technical_winner)}`,
    `Technical last: ${name(w.technical_last)}`,
  ];
  if (state.final) {
    lines.push(`Finalists: ${w.finalists.map(name).join(", ")}`, `Winner: ${name(w.winner)}`);
  } else {
    lines.push(`Star Baker: ${w.star_baker.map(name).join(", ")}`);
  }
  lines.push(`Handshakes: ${shakeCounts.join(", ") || "none"}`);
  if (!state.final) lines.push(`Went home: ${w.eliminated.map(name).join(", ") || "nobody"}`);
  lines.push(`Data: ${JSON.stringify(w)}`);
  return lines.join("\n");
}

function toggle(label, pressed, onclick, team) {
  return el("button", {
    class: `tog${pressed ? " on" : ""}${team ? ` team-${team}` : ""}`,
    "aria-pressed": pressed ? "true" : "false",
    onclick,
  }, label);
}

function bakerRow(id) {
  const b = byId(id);
  const team = ownerOf(season, id);
  const shakes = state.shakes[id] || 0;
  const setShakes = (n) => act(() => {
    if (n > 0) state.shakes[id] = n;
    else delete state.shakes[id];
  });
  const controls = state.final
    ? [
        toggle("Finalist", state.finalists.includes(id), () => act(() => {
          state.finalists = toggleIn(state.finalists, id);
          if (!state.finalists.includes(id) && state.winner === id) state.winner = null;
        })),
        toggle("Winner", state.winner === id, () => act(() => {
          state.winner = state.winner === id ? null : id;
          if (state.winner && !state.finalists.includes(id)) state.finalists.push(id);
        })),
      ]
    : [
        toggle("Star Baker", state.star.includes(id), () => act(() => { state.star = toggleIn(state.star, id); })),
        toggle("Went home", state.home.includes(id), () => act(() => { state.home = toggleIn(state.home, id); })),
      ];
  return el("article", { class: `panel result-row${state.home.includes(id) && !state.final ? " leaving" : ""}` },
    el("div", { class: "who" },
      avatar(b),
      el("div", {},
        el("div", { class: "rname" }, b.name),
        team && el("span", { class: `chip team-${team}` }, TEAMS[team].name),
      ),
    ),
    el("div", { class: "controls" },
      toggle("Technical win", state.techWin === id, () => act(() => setTech("techWin", "techLast", id))),
      toggle("Technical last", state.techLast === id, () => act(() => setTech("techLast", "techWin", id))),
      ...controls,
      el("div", { class: "stepper", role: "group", "aria-label": `Handshakes for ${b.name}` },
        el("span", { class: "muted" }, "Handshakes"),
        el("button", { "aria-label": "One fewer handshake", disabled: shakes === 0, onclick: () => setShakes(shakes - 1) }, "−"),
        el("span", { class: "count", "aria-live": "polite" }, shakes),
        el("button", { "aria-label": "One more handshake", onclick: () => setShakes(shakes + 1) }, "+"),
      ),
    ),
  );
}

function renderSummary() {
  const issues = problems();
  const status = el("span", { class: "copy-status", "aria-live": "polite" });
  const text = issues.length ? "" : summaryText();
  const area = el("textarea", { readonly: true, "aria-label": "Results summary" });
  area.value = text;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = `Copied to clipboard (${text.length} characters). Paste it into the Bake Off chat.`;
    } catch {
      area.select();
      status.textContent = "Could not copy automatically. The text is selected: press Cmd+C.";
    }
  };
  return el("section", { class: "panel summary" },
    el("h2", {}, `Send week ${weekNo}`),
    issues.length
      ? el("ul", { class: "issues" }, issues.map((t) => el("li", {}, t)))
      : el("p", {}, "Copy this and paste it into the Bake Off chat. The points page updates about a minute later."),
    !issues.length && area,
    el("p", { class: "actions-row" },
      el("button", { class: "primary", disabled: issues.length > 0, onclick: copy }, "Copy results"),
      el("button", { onclick: () => { if (confirm(`Clear everything entered for week ${weekNo}?`)) act(() => { state = blank(); }); } }, "Clear"),
      status,
    ),
  );
}

function render() {
  const inTent = survivors(season, season.weeks.length - 1).sort((a, b) => name(a).localeCompare(name(b)));
  const theme = el("input", { type: "text", value: state.theme, placeholder: "Theme, e.g. Bread (optional)", "aria-label": "Week theme" });
  theme.addEventListener("input", () => { state.theme = theme.value; save(); });
  theme.addEventListener("change", render);
  app.replaceChildren(
    el("section", { class: "panel week-head" },
      el("h2", {}, `Week ${weekNo}`),
      el("p", { class: "muted" }, `${inTent.length} bakers still in. Tap what happened in this episode. Tap again to undo.`),
      theme,
      el("label", { class: "final-toggle" },
        el("input", { type: "checkbox", checked: state.final, onchange: (e) => act(() => { state.final = e.target.checked; }) }),
        " This is the final",
      ),
    ),
    el("div", { class: "result-list" }, inTent.map(bakerRow)),
    renderSummary(),
  );
}

async function init() {
  try {
    const [bakerData, seasonData] = await Promise.all([loadJSON("data/bakers.json"), loadJSON("data/season.json")]);
    bakers = bakerData.bakers;
    season = seasonData;
    if (!season.teams.graham.length) {
      app.replaceChildren(el("div", { class: "panel empty" },
        el("h2", {}, "No teams yet"),
        el("p", {}, "Draft first. ", el("a", { href: "draft.html" }, "Go to the draft"), "."),
      ));
      return;
    }
    weekNo = season.weeks.length + 1;
    state = restore();
    render();
  } catch (err) {
    app.replaceChildren(el("p", { class: "panel" }, `Something went wrong loading the bakers: ${err.message}`));
  }
}

init();
