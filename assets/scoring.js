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

// Every week field named in season.scoring earns its value per baker listed.
export function score(season) {
  const points = {};
  const weekPoints = [];
  for (const week of season.weeks) {
    const swing = { graham: 0, lauren: 0 };
    for (const [key, value] of Object.entries(season.scoring)) {
      for (const id of asList(week[key])) {
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
