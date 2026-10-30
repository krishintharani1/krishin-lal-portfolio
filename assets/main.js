import { SYSTEMS, PROJECTS, ABOUT, CONTACT, MODES } from "./data.js";
import { initLab } from "./scene.js";

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

const body = document.body;
const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const intro = $("#top");
const hint = $("#hint");
const detail = $("#detail");
const detailEyebrow = $("#detail-eyebrow");
const detailTitle = $("#detail-title");
const detailLede = $("#detail-lede");
const detailContent = $("#detail-content");
const detailFooter = $("#detail-footer");
const detailClose = $("#detail-close");
const detailBody = $("#detail-body");
const preview = $("#preview");
const inspectButton = $("#inspect-item");
const indexPanel = $("#index-panel");
const indexToggle = $("#index-toggle");
const indexClose = $("#index-close");
const contactToggle = $("#contact-toggle");
const fallback = $("#fallback");
const fallbackIndex = $("#fallback-index");
const enterLab = $("#enter-lab");
const introIndex = $("#intro-index");
const statusText = $("#status-text");
const dockKicker = $("#dock-kicker");
const dockName = $("#dock-name");
const prevButton = $("#prev-item");
const nextButton = $("#next-item");
const pingButton = $("#ping-btn");
const zeroGButton = $("#zero-g");
const modeButtons = $$(".mode-btn");
const toast = $("#toast");

let lab = null;
let currentMode = "systems";
let currentIndex = 0;
let currentItem = SYSTEMS[0];
let detailOpen = false;
let detailTrigger = null;
let indexOpen = false;
let indexTrigger = null;
let hintTimer = null;
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function updateModeButtons() {
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === currentMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function updateDock() {
  if (!currentItem) return;
  const isSystem = currentMode === "systems";
  if (dockKicker) dockKicker.textContent = `${isSystem ? "SYSTEM" : "PROJECT"} ${currentItem.num} / ${currentItem.tag}`;
  if (dockName) dockName.textContent = currentItem.name;
  $("#preview-number").textContent = `${currentItem.num} / ${currentItem.tag}`;
  $("#preview-metric").textContent = currentItem.metric;
  $("#preview-title").textContent = currentItem.name;
  $("#preview-lede").textContent = currentItem.lede;
  inspectButton.innerHTML = `Explore this ${isSystem ? "system" : "project"} <span aria-hidden="true">↗</span>`;
  if (!document.documentElement.classList.contains("no-webgl")) {
    setStatus(isSystem ? `${SYSTEMS.length} MACHINES ONLINE` : `${PROJECTS.length} PROJECTS ONLINE`);
  }
  updateModeButtons();
}

function syncMotion(state) {
  if (!zeroGButton) return;
  const motionOn = Boolean(state.motion);
  const zeroGOn = Boolean(state.zeroG) && motionOn;
  zeroGButton.disabled = !motionOn;
  zeroGButton.setAttribute("aria-pressed", zeroGOn ? "true" : "false");
  zeroGButton.textContent = zeroGOn ? "Zero-G on" : "Zero-G off";
  zeroGButton.title = motionOn ? "" : "Reduced motion is enabled";
}

function engageLab() {
  if (body.classList.contains("is-exploring")) return;
  if (hint) {
    hint.hidden = false;
    hint.classList.remove("is-gone");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hint.classList.add("is-gone"), 6500);
  }
  body.classList.add("is-exploring");
}

function buildIndex() {
  const systemsList = $("#index-systems");
  const projectsList = $("#index-projects");
  const aboutBox = $("#index-about");
  const contactBox = $("#index-contact");

  if (systemsList) {
    systemsList.innerHTML = SYSTEMS.map((item, index) => `
      <li>
        <button class="index-row" type="button" data-mode="systems" data-index="${index}">
          <span class="index-row__num">${item.num}</span>
          <span class="index-row__name">${item.name}</span>
          <span class="index-row__meta">${item.metric}</span>
          <span class="index-row__arrow" aria-hidden="true">↗</span>
        </button>
      </li>
    `).join("");
  }

  if (projectsList) {
    projectsList.innerHTML = PROJECTS.map((item, index) => `
      <li>
        <button class="index-row" type="button" data-mode="projects" data-index="${index}">
          <span class="index-row__num">${item.num}</span>
          <span class="index-row__name">${item.name}</span>
          <span class="index-row__meta">${item.metric}</span>
          <span class="index-row__arrow" aria-hidden="true">↗</span>
        </button>
      </li>
    `).join("");
  }

  if (aboutBox) {
    aboutBox.innerHTML = `
      <p class="index-about__lede">${ABOUT.lede}</p>
      ${ABOUT.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      <div class="index-about__facts">
        ${ABOUT.facts.map((fact) => `<div><span>${fact.label}</span><strong>${fact.value}</strong></div>`).join("")}
      </div>
      <ol class="index-about__principles">
        ${ABOUT.principles.map((principle) => `<li>${principle}</li>`).join("")}
      </ol>
      <p class="index-about__stack">${ABOUT.stack}</p>
    `;
  }

  if (contactBox) {
    contactBox.innerHTML = `
      <a class="index-contact__mail" href="mailto:${CONTACT.email}">${CONTACT.email}</a>
      <div class="index-contact__links">
        <a href="${CONTACT.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        <a href="${CONTACT.phoneHref}">${CONTACT.phone}</a>
        <a href="${CONTACT.resume}" download>Résumé ↓</a>
        <button type="button" data-copy-email>Copy email ⧉</button>
      </div>
    `;
  }
}

function openIndex(trigger = document.activeElement) {
  if (!indexPanel) return;
  if (detailOpen) closeDetail(false);
  indexOpen = true;
  indexTrigger = trigger && trigger !== body ? trigger : indexToggle;
  indexPanel.hidden = false;
  if (!indexPanel.open) indexPanel.showModal();
  indexToggle?.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => indexClose?.focus());
}

function closeIndex(restoreFocus = true) {
  if (!indexPanel || !indexOpen) return;
  indexOpen = false;
  indexPanel.close();
  indexPanel.hidden = true;
  indexToggle?.setAttribute("aria-expanded", "false");
  if (restoreFocus && indexTrigger && indexTrigger.offsetParent !== null) {
    indexTrigger.focus();
  } else if (restoreFocus) {
    indexToggle?.focus();
  }
}

function toggleIndex() {
  if (indexOpen) closeIndex();
  else openIndex(indexToggle);
}

function detailMarkup(kind, item) {
  if (kind === "system") {
    return `
      <section class="detail__section">
        <h3 class="detail__label">Problem</h3>
        <p>${item.problem}</p>
      </section>
      <section class="detail__section">
        <h3 class="detail__label">Approach</h3>
        <ul class="detail__list">${item.approach.map((step) => `<li>${step}</li>`).join("")}</ul>
      </section>
      <p class="detail__pipeline">${item.pipeline}</p>
      <p class="detail__outcome"><strong>Outcome</strong> ${item.outcome}</p>
      <ul class="detail__tags">${item.stack.map((tag) => `<li>${tag}</li>`).join("")}</ul>
    `;
  }

  if (kind === "project") {
    return `
      <section class="detail__section">
        <h3 class="detail__label">What it is</h3>
        <p>${item.body}</p>
      </section>
      <ul class="detail__tags">${item.stack.map((tag) => `<li>${tag}</li>`).join("")}</ul>
    `;
  }

  if (kind === "about") {
    return `
      ${ABOUT.body.map((paragraph) => `<section class="detail__section"><p>${paragraph}</p></section>`).join("")}
      <div class="detail__facts">
        ${ABOUT.facts.map((fact) => `<div><span>${fact.label}</span><strong>${fact.value}</strong></div>`).join("")}
      </div>
      <section class="detail__section">
        <h3 class="detail__label">Operating principles</h3>
        <ol class="detail__principles">${ABOUT.principles.map((principle) => `<li>${principle}</li>`).join("")}</ol>
      </section>
      <p class="detail__pipeline">${ABOUT.stack}</p>
    `;
  }

  return `
    <a class="detail__mail" href="mailto:${CONTACT.email}">${CONTACT.email} ↗</a>
  `;
}

function detailFooterMarkup(kind) {
  if (kind === "system" || kind === "project") {
    return `
      <button type="button" data-detail-next>NEXT ${kind === "system" ? "SYSTEM" : "PROJECT"} →</button>
      <button type="button" data-copy-email>COPY EMAIL</button>
    `;
  }

  if (kind === "about") {
    return `
      <button type="button" data-open-contact>SAY HI ↗</button>
      <a href="${CONTACT.resume}" download>RÉSUMÉ ↓</a>
    `;
  }

  return `
    <a href="${CONTACT.linkedin}" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a>
    <a href="${CONTACT.phoneHref}">${CONTACT.phone}</a>
    <a href="${CONTACT.resume}" download>RÉSUMÉ ↓</a>
    <button type="button" data-copy-email>COPY EMAIL ⧉</button>
  `;
}

function renderDetail(kind, item) {
  if (!detail) return;
  const eyebrow = kind === "system"
    ? `SYSTEM ${item.num} / ${item.tag} / PRODUCTION`
    : kind === "project"
      ? `PROJECT ${item.num} / ${item.tag}`
      : kind === "about"
        ? "ABOUT / OPERATOR"
        : "CONTACT / OPEN CHANNEL";

  detailEyebrow.textContent = eyebrow;
  detailTitle.textContent = kind === "contact" ? CONTACT.title : item.title || item.name;
  detailLede.textContent = kind === "contact" ? CONTACT.lede : item.lede;
  $("#detail-metric").textContent = item.metric || "Open a conversation";
  detailContent.innerHTML = detailMarkup(kind, item);

  const footerKey = kind;
  if (detailFooter.dataset.kind !== footerKey) {
    detailFooter.innerHTML = detailFooterMarkup(kind);
    detailFooter.dataset.kind = footerKey;
  }
}

function openDetail(kind, item, trigger) {
  if (!detail) return;
  if (indexOpen) closeIndex(false);
  engageLab();
  renderDetail(kind, item);
  const machine = kind === "system" || kind === "project";
  if (lab && machine) {
    const mode = kind === "system" ? "systems" : "projects";
    lab.enter(mode, MODES[mode].items.indexOf(item));
  } else if (lab) {
    lab.exit();
  }
  detailTrigger = trigger || (document.activeElement !== body ? document.activeElement : indexToggle);
  detail.hidden = false;
  detail.dataset.kind = kind;
  body.classList.add("is-inside");
  preview.hidden = true;
  intro.querySelector(".intro__actions").inert = true;
  detailOpen = true;
  detailBody.scrollTop = 0;
  if (!detail.contains(document.activeElement)) {
    requestAnimationFrame(() => detailClose?.focus());
  }
}

function closeDetail(restoreFocus = true) {
  if (!detail || !detailOpen) return;
  detail.hidden = true;
  detailOpen = false;
  body.classList.remove("is-inside");
  preview.hidden = false;
  intro.querySelector(".intro__actions").inert = false;
  if (lab) lab.exit();
  if (restoreFocus) {
    if (detailTrigger && detailTrigger.offsetParent !== null) detailTrigger.focus();
    else indexToggle?.focus();
  }
}

function copyEmail() {
  const email = CONTACT.email;
  const done = () => showToast(`Copied ${email}`);
  const fallbackCopy = () => {
    const area = document.createElement("textarea");
    area.value = email;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      if (document.execCommand("copy")) done();
      else showToast(`Copy failed: ${email}`);
    } catch (error) {
      showToast(`Copy failed: ${email}`);
    }
    area.remove();
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(done).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function setMode(mode) {
  if (!MODES[mode] || mode === currentMode) return;
  currentMode = mode;
  currentIndex = 0;
  currentItem = MODES[mode].items[0];
  updateDock();
  closeDetail(false);
  if (lab) lab.setMode(mode);
}

function step(direction) {
  if (lab) {
    lab.step(direction);
    return;
  }
  const items = MODES[currentMode].items;
  currentIndex = (currentIndex + direction + items.length) % items.length;
  currentItem = items[currentIndex];
  updateDock();
  if (detailOpen) openDetail(currentMode === "systems" ? "system" : "project", currentItem, indexToggle);
}

function ping() {
  if (lab) lab.ping();
  showToast("Signal sent through the lab.");
}

function toggleZeroG() {
  if (!lab) return;
  const state = lab.getState();
  if (!state.motion) return;
  lab.setZeroG(!state.zeroG);
  syncMotion({ ...state, zeroG: !state.zeroG });
}

function handleFallback() {
  lab = null;
  pingButton.disabled = true;
  syncMotion({ motion: false, zeroG: false });
  engageLab();
  setStatus("3D OFFLINE");
  if (fallback) fallback.hidden = false;
  openIndex(indexToggle);
  showToast("3D view unavailable. Index opened.");
}

function handleKeydown(event) {
  if (event.key === "Escape") {
    if (detailOpen) {
      event.preventDefault();
      closeDetail();
    } else if (indexOpen) {
      event.preventDefault();
      closeIndex();
    }
  }

  if (event.key.toLowerCase() === "r" && lab) {
    const active = document.activeElement;
    if (active && active.closest && active.closest(".index-panel, .detail")) return;
    event.preventDefault();
    lab.reset();
    closeDetail(false);
    showToast("View reset.");
  }
}

function init() {
  buildIndex();
  updateDock();
  syncMotion({ motion: !reduceQuery.matches, zeroG: !reduceQuery.matches });
  if (hint) hint.hidden = true;

  enterLab?.addEventListener("click", () => {
    openDetail(currentMode === "systems" ? "system" : "project", currentItem, enterLab);
  });
  inspectButton.addEventListener("click", () => {
    openDetail(currentMode === "systems" ? "system" : "project", currentItem, inspectButton);
  });

  introIndex?.addEventListener("click", () => {
    engageLab();
    openIndex(indexToggle);
  });

  indexToggle?.addEventListener("click", toggleIndex);
  indexClose?.addEventListener("click", () => closeIndex());
  indexPanel.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeIndex();
  });
  indexPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(indexPanel.querySelectorAll("button:not(:disabled), a[href]"));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  $("#reset-view").addEventListener("click", () => {
    engageLab();
    closeDetail(false);
    if (lab) lab.reset();
    showToast("View reset.");
  });
  contactToggle?.addEventListener("click", () => openDetail("contact", CONTACT, contactToggle));
  detailClose?.addEventListener("click", () => closeDetail());
  fallbackIndex?.addEventListener("click", () => openIndex(fallbackIndex));

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  prevButton?.addEventListener("click", () => step(-1));
  nextButton?.addEventListener("click", () => step(1));
  pingButton?.addEventListener("click", ping);
  zeroGButton?.addEventListener("click", toggleZeroG);

  document.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-email]");
    if (copyButton) {
      event.preventDefault();
      copyEmail();
      return;
    }

    const contactButton = event.target.closest("[data-open-contact]");
    if (contactButton) {
      openDetail("contact", CONTACT, contactButton);
      return;
    }

    const indexRow = event.target.closest(".index-row");
    if (indexRow) {
      const mode = indexRow.dataset.mode;
      const index = Number(indexRow.dataset.index);
      const item = MODES[mode].items[index];
      currentMode = mode;
      currentIndex = index;
      currentItem = item;
      updateDock();
      closeIndex(false);
      if (lab) lab.focus(mode, index);
      openDetail(mode === "systems" ? "system" : "project", item, indexToggle);
    }
  });

  detail.addEventListener("click", (event) => {
    const next = event.target.closest("[data-detail-next]");
    if (next) {
      event.preventDefault();
      step(1);
    }
  });

  document.addEventListener("keydown", handleKeydown);

  if (typeof reduceQuery.addEventListener === "function") {
    reduceQuery.addEventListener("change", (event) => {
      syncMotion({ motion: !event.matches, zeroG: !event.matches });
    });
  }

  lab = initLab({
    onReady(state) {
      setStatus(`${SYSTEMS.length} MACHINES ONLINE`);
      syncMotion(state);
      if (fallback) fallback.hidden = true;
      body.classList.add("is-ready");
    },
    onChange(state) {
      currentMode = state.mode;
      currentIndex = state.index;
      currentItem = state.item;
      updateDock();
      if (state.zeroG !== undefined) syncMotion(state);
    },
    onSelect(item, mode) {
      openDetail(mode === "systems" ? "system" : "project", item, indexToggle);
    },
    onInteract() {
      engageLab();
    },
    onMotionChange: syncMotion,
    onFallback: handleFallback
  });

  if (!lab && !indexOpen) {
    handleFallback();
  }
}

init();
