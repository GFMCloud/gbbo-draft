// Scoring shared by the points page and scripts/check.mjs.

export function asList(value) {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

export function ownerOf(season, id) {
  if (season.teams.graham.includes(id)) return "graham";
  if (season.teams.lauren.includes(id)) return "lauren";
  return null;
}

// Drafted bakers still in after this week: not sent home this week or earlier.
export function survivors(season, weekIndex) {
  const gone = new Set(season.weeks.slice(0, weekIndex + 1).flatMap((w) => asList(w.eliminated)));
  return [...season.teams.graham, ...season.teams.lauren].filter((id) => !gone.has(id));
}

// Every week field named in season.scoring earns its value per baker listed.
// "survived" is computed from eliminations rather than stored.
export function score(season) {
  const points = {};
  const weekPoints = [];
  for (const [i, week] of season.weeks.entries()) {
    const swing = { graham: 0, lauren: 0 };
    const events = { ...week, survived: survivors(season, i) };
    for (const [key, value] of Object.entries(season.scoring)) {
      for (const id of asList(events[key])) {
        points[id] = (points[id] || 0) + value;
        const team = ownerOf(season, id);
        if (team) swing[team] += value;
      }
    }
    weekPoints.push(swing);
  }
  const total = (team) => season.teams[team].reduce((sum, id) => sum + (points[id] || 0), 0);
  return { points, weekPoints, totals: { graham: total("graham"), lauren: total("lauren") } };
}
