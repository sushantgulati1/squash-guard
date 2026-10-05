const DEFAULTS = { owners: [], branches: ["qa", "staging", "main"] };
const $ = (id) => document.getElementById(id);
const parse = (s) => [...new Set(s.split(/[,\n]/).map((v) => v.trim()).filter(Boolean))];

function renderChips(field, emptyText) {
  const box = $(field + "-chips");
  const items = parse($(field).value);
  box.textContent = "";
  if (!items.length) {
    const e = document.createElement("span");
    e.className = "empty";
    e.textContent = emptyText;
    box.appendChild(e);
    return;
  }
  for (const v of items) {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = v;
    box.appendChild(c);
  }
}

const refresh = () => {
  renderChips("branches", "No branches protected");
  renderChips("owners", "All repositories");
};

chrome.storage.local.get(DEFAULTS, (cfg) => {
  $("branches").value = cfg.branches.join(", ");
  $("owners").value = cfg.owners.join(", ");
  refresh();
});

$("branches").addEventListener("input", refresh);
$("owners").addEventListener("input", refresh);

function save() {
  chrome.storage.local.set(
    { branches: parse($("branches").value), owners: parse($("owners").value) },
    () => {
      $("branches").value = parse($("branches").value).join(", ");
      $("owners").value = parse($("owners").value).join(", ");
      refresh();
      $("status").classList.add("show");
      setTimeout(() => $("status").classList.remove("show"), 1500);
    }
  );
}

$("save").addEventListener("click", save);
document.addEventListener("keydown", (e) => e.key === "Enter" && save());
