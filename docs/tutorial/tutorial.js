// Generic, data-attribute driven interactivity for the tutorial pages.

// Tabs: container [data-tabs]; buttons [data-tab="id"]; panels [data-panel="id"].
document.querySelectorAll("[data-tabs]").forEach((group) => {
  const tabs = group.querySelectorAll("[data-tab]");
  const panels = group.querySelectorAll("[data-panel]");
  function activate(id) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle("active", p.dataset.panel === id));
  }
  tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.tab)));
  if (tabs[0]) activate(tabs[0].dataset.tab);
});

// Accordion Q&A: each .qa has a <button> that toggles the .open class.
document.querySelectorAll(".qa > button").forEach((btn) => {
  btn.addEventListener("click", () => btn.parentElement.classList.toggle("open"));
});

// Optional "expand all / collapse all" buttons: [data-expand-all] / [data-collapse-all]
document.querySelectorAll("[data-expand-all]").forEach((b) =>
  b.addEventListener("click", () =>
    document.querySelectorAll(".qa").forEach((q) => q.classList.add("open")),
  ),
);
document.querySelectorAll("[data-collapse-all]").forEach((b) =>
  b.addEventListener("click", () =>
    document.querySelectorAll(".qa").forEach((q) => q.classList.remove("open")),
  ),
);
