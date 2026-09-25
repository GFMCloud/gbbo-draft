// Shared helpers for the draft and points pages.

export const TEAMS = {
  graham: { key: "graham", name: "Graham" },
  lauren: { key: "lauren", name: "Lauren" },
};

export function otherTeam(key) {
  return key === "graham" ? "lauren" : "graham";
}

export async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// Photo with an initial-letter fallback if the hotlinked image fails.
export function avatar(baker) {
  const fallback = () =>
    el("div", { class: "avatar fallback", role: "img", "aria-label": baker.name }, baker.name.charAt(0));
  if (!baker.photo) return fallback();
  const img = el("img", {
    class: "avatar",
    src: baker.photo,
    alt: baker.name,
    loading: "lazy",
    referrerpolicy: "no-referrer",
  });
  img.addEventListener("error", () => img.replaceWith(fallback()), { once: true });
  return img;
}
