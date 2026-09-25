import { TEAMS, otherTeam, loadJSON, el, avatar } from "./common.js";

const STORAGE_KEY = "gbbo-draft-2026";
const app = document.getElementById("app");

let bakers = [];
let state = { first: null, picks: [] }; // picks: [{ id, team }]

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const ids = new Set(bakers.map((b) => b.id));
    if (saved && Array.isArray(saved.picks) && saved.picks.every((p) => ids.has(p.id))) state = saved;
  } catch {}
}

const byId = (id) => bakers.find((b) => b.id === id);
const teamOfPick = (index) => (index % 2 === 0 ? state.first : otherTeam(state.first));
const done = () => state.picks.length === bakers.length;
const picksFor = (team) => state.picks.map((p, i) => ({ ...p, n: i + 1 })).filter((p) => p.team === team);

function render() {
  app.replaceChildren();
  if (!state.first) return renderCoin();
  app.append(renderTurnBar());
  const layout = el("div", { class: "draft-layout" }, renderGrid(), renderRosters());
  if (done()) app.append(renderSummary());
  app.append(layout);
}

function renderCoin() {
  const coin = el("div", { class: "coin", "aria-live": "polite" }, "?");
  const flipBtn = el("button", { class: "primary" }, "Flip for first pick");
  const stage = el("div", { class: "panel coin-stage" },
    el("h2", {}, "Who picks first?"),
    el("p", { class: "muted" }, `${bakers.length} bakers. You take turns, one pick each, until you both have ${bakers.length / 2}.`),
    coin,
    flipBtn,
  );
  flipBtn.addEventListener("click", () => {
    flipBtn.disabled = true;
    coin.classList.add("spinning");
    const winner = crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? "graham" : "lauren";
    setTimeout(() => {
      coin.classList.remove("spinning");
      coin.textContent = TEAMS[winner].name;
      coin.style.background = `var(--${winner})`;
      stage.append(
        el("p", { class: "now" }, el("strong", {}, TEAMS[winner].name), " picks first."),
        el("button", {
          class: "primary",
          onclick: () => { state.first = winner; save(); render(); },
        }, "Start the draft"),
      );
    }, 1400);
  });
  app.append(stage);
}

function renderTurnBar() {
  const n = state.picks.length;
  const now = done()
    ? el("div", { class: "now" }, "Draft complete.")
    : el("div", { class: `now team-${teamOfPick(n)}` },
        `Pick ${n + 1} of ${bakers.length}: `, el("strong", {}, `${TEAMS[teamOfPick(n)].name}'s turn`));
  return el("div", { class: "turn-bar" },
    now,
    el("div", { class: "actions" },
      el("button", { disabled: n === 0, onclick: undo }, "Undo last pick"),
      el("button", { onclick: startOver }, "Start over"),
    ),
  );
}

function renderGrid() {
  const taken = new Map(state.picks.map((p, i) => [p.id, { ...p, n: i + 1 }]));
  const current = done() ? null : teamOfPick(state.picks.length);
  const grid = el("div", { class: "baker-grid" });
  for (const b of bakers) {
    const pick = taken.get(b.id);
    const meta = [b.age && `${b.age}`, b.hometown, b.occupation].filter(Boolean).join(" · ");
    const action = pick
      ? el("span", { class: `chip team-${pick.team}` }, `${TEAMS[pick.team].name} · pick ${pick.n}`)
      : current && el("button", { class: `pick team-${current}`, onclick: () => choose(b.id) },
          `Draft to ${TEAMS[current].name}`);
    grid.append(el("article", { class: `baker-card${pick ? " taken" : ""}` },
      avatar(b),
      el("h3", {}, b.name),
      el("div", { class: "meta" }, meta),
      el("p", { class: "bio" }, b.bio),
      action,
    ));
  }
  return grid;
}

function renderRosters() {
  const box = el("aside", { class: "rosters" });
  for (const team of [state.first, otherTeam(state.first)]) {
    const picks = picksFor(team);
    box.append(el("section", { class: `panel roster team-${team}` },
      el("h2", {}, TEAMS[team].name, el("span", {}, `${picks.length}/${bakers.length / 2}`)),
      picks.length
        ? el("ol", {}, picks.map((p) => el("li", {}, byId(p.id).name, " ", el("span", { class: "pickno" }, `#${p.n}`))))
        : el("p", { class: "muted" }, "No picks yet."),
    ));
  }
  return box;
}

function summaryText() {
  const names = (team) => picksFor(team).map((p) => byId(p.id).name).join(", ");
  const order = state.picks.map((p, i) => `${i + 1} ${TEAMS[p.team].name}: ${byId(p.id).name}`).join("; ");
  return [
    `GBBO 2026 draft complete. First pick: ${TEAMS[state.first].name}.`,
    `Graham: ${names("graham")}`,
    `Lauren: ${names("lauren")}`,
    `Pick order: ${order}`,
  ].join("\n");
}

function renderSummary() {
  const text = summaryText();
  const status = el("span", { class: "copy-status", "aria-live": "polite" });
  const area = el("textarea", { readonly: true, "aria-label": "Draft summary" });
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
  return el("section", { class: "panel summary", style: "margin-bottom:16px" },
    el("h2", {}, "Save the teams"),
    el("p", {}, "Copy this and paste it into the Bake Off chat. The chat saves both teams to the points page."),
    area,
    el("p", {}, el("button", { class: "primary", onclick: copy }, "Copy summary"), status),
  );
}

function choose(id) {
  if (done() || state.picks.some((p) => p.id === id)) return;
  state.picks.push({ id, team: teamOfPick(state.picks.length) });
  save();
  render();
}

function undo() {
  state.picks.pop();
  save();
  render();
}

function startOver() {
  if (!confirm("Clear every pick and flip again?")) return;
  state = { first: null, picks: [] };
  save();
  render();
}

async function init() {
  try {
    const [bakerData, season] = await Promise.all([loadJSON("data/bakers.json"), loadJSON("data/season.json")]);
    bakers = [...bakerData.bakers].sort((a, b) => a.name.localeCompare(b.name));
    if (season.teams.graham.length || season.teams.lauren.length) {
      app.replaceChildren(el("div", { class: "panel empty" },
        el("h2", {}, "The draft is done"),
        el("p", {}, "Both teams are saved. ", el("a", { href: "index.html" }, "See the points page"), "."),
      ));
      return;
    }
    restore();
    render();
  } catch (err) {
    app.replaceChildren(el("p", { class: "panel" }, `Something went wrong loading the draft: ${err.message}`));
  }
}

init();
