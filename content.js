(function () {
  "use strict";

  const DEFAULTS = { owners: [], branches: ["qa", "staging", "main"] };
  let config = { ...DEFAULTS };

  const XP_BASE_BRANCH = '(//a[@data-component="BranchName"])[1]';
  const XP_SQUASH_BUTTON =
    '//button[.//span[@data-component="text"][normalize-space(.)="Squash and merge"]]';
  const XP_SQUASH_MENU_ITEM =
    '//li[@role="menuitemradio"]' +
    '[.//span[@data-component="ActionList.Item.Label"][normalize-space(.)="Squash and merge"]]';

  const style = document.createElement("style");
  style.textContent =
    ".sqm-blocked{opacity:.45!important;cursor:not-allowed!important;}";
  document.documentElement.appendChild(style);

  function reason(base) {
    return `Squash and merge is disabled: this PR targets "${base}", a protected branch.`;
  }

  function isEnabledForUrl() {
    const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/\d+/);
    if (!match) return false;
    if (config.owners.length === 0) return true;
    const owner = match[1].toLowerCase();
    const repo = `${owner}/${match[2].toLowerCase()}`;
    return config.owners.includes(owner) || config.owners.includes(repo);
  }

  function firstByXPath(expr) {
    return document.evaluate(
      expr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
  }

  function getBaseBranch() {
    const el = firstByXPath(XP_BASE_BRANCH);
    if (!el) return null;
    const match = (el.getAttribute("href") || "").match(/\/tree\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : el.textContent.trim();
  }

  function guard(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function keyGuard(event) {
    if (event.key === "Enter" || event.key === " ") guard(event);
  }

  function block(el, isButton, msg) {
    if (!el || el.dataset.sqmBlocked === "1") return;
    el.dataset.sqmBlocked = "1";
    el.classList.add("sqm-blocked");
    el.setAttribute("aria-disabled", "true");
    el.title = msg;
    if (isButton) el.setAttribute("disabled", "");
    el.addEventListener("click", guard, true);
    el.addEventListener("mousedown", guard, true);
    el.addEventListener("keydown", keyGuard, true);
  }

  function unblock(el) {
    if (!el || el.dataset.sqmBlocked !== "1") return;
    delete el.dataset.sqmBlocked;
    el.classList.remove("sqm-blocked");
    el.removeAttribute("aria-disabled");
    el.removeAttribute("disabled");
    el.removeAttribute("title");
    el.removeEventListener("click", guard, true);
    el.removeEventListener("mousedown", guard, true);
    el.removeEventListener("keydown", keyGuard, true);
  }

  function apply() {
    const button = firstByXPath(XP_SQUASH_BUTTON);
    const item = firstByXPath(XP_SQUASH_MENU_ITEM);

    const base = isEnabledForUrl() ? getBaseBranch() : null;
    if (base !== null && config.branches.includes(base)) {
      block(button, true, reason(base));
      block(item, false, reason(base));
    } else if (base !== null || !isEnabledForUrl()) {
      unblock(button);
      unblock(item);
    }
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      apply();
    });
  }

  function loadConfig(cb) {
    chrome.storage.local.get(DEFAULTS, (stored) => {
      config = {
        owners: (stored.owners || []).map((s) => s.toLowerCase()),
        branches: stored.branches || [],
      };
      cb && cb();
    });
  }

  chrome.storage.onChanged.addListener(() => loadConfig(schedule));

  loadConfig(() => {
    new MutationObserver(schedule).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    document.addEventListener("turbo:load", schedule);
    document.addEventListener("turbo:render", schedule);
    document.addEventListener("pjax:end", schedule);
    apply();
  });
})();
