import gsap from "gsap";
import { PROJECTS, FILTERS } from "./data.js";

/* ================================================================
   The archive stage: 28 tiles pinned in 3D space, a world you drag
   to look through. Hover colorises; filters spotlight whole years
   of one discipline; the click hands its rectangle to the portal.
================================================================ */

const clamp = gsap.utils.clamp;

export default function createArchive({ stage, world, onOpenTile }) {
  const YAW_MAX = 0.62, PITCH_MAX = 0.17, Z_MAX = 460, Z_MIN = -900;

  const state = {
    yaw: 0, pitch: 0, yawT: 0, pitchT: 0, z: 90, zT: 90,
    dragging: false, lastX: 0, lastY: 0,
    velocity: 0, ready: false, filter: FILTERS[0],
  };

  /* deterministic scatter: two drifting bands with depth */
  const TILES = PROJECTS.map((p, i) => {
    const col = i % 7, row = Math.floor(i / 7);
    const wide = 1500;
    const x = -wide + (col / 6) * wide * 2 + (row % 2 ? 130 : -110);
    const y = 210 - row * 150 + (i % 3) * 26 - 60;
    const z = -140 - Math.abs(col - 3) * 90 - (i % 5) * 55 + row * 80;
    const w = (520 - row * 60) * (0.82 + ((i * 37) % 30) / 100);
    const h = w * (row === 1 ? 1.32 : 0.72);
    return { p, i, x, y: y * (row === 1 ? 1.05 : 0.9), z, w, h };
  });

  const tileEls = TILES.map((t) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tile";
    el.setAttribute("aria-label", `${t.p.title} — ${t.p.category}, ${t.p.year}`);
    el.innerHTML = `
      <span class="tile__surface"><img src="${t.p.media[0]}" alt="" draggable="false"></span>
      <span class="tile__label">${t.p.title}</span>`;
    el.dataset.go = t.p.slug;
    el.dataset.cat = t.p.category;
    el.style.opacity = "0";
    world.appendChild(el);
    el.addEventListener("click", () => {
      if (Math.abs(state.yaw - state.yawT) > 0.06) return; /* ignore drags */
      onOpenTile(t, el);
    });
    el.addEventListener("pointerenter", () => {
      readout.textContent = `${t.p.title} — ${t.p.category}, ${t.p.year}`;
      TILE_ELS.forEach((o) => o.el.dataset.related = o.p.category === t.p.category ? "true" : "false");
    });
    el.addEventListener("pointerleave", () => {
      readout.textContent = DEFAULT_READOUT;
      TILE_ELS.forEach((o) => o.el.dataset.related = "false");
    });
    return { t, el };
  });
  const TILE_ELS = tileEls;

  /* fixed UI bits the stage owns */
  const readout = document.querySelector(".focus-readout");
  const depth = document.querySelector(".depth");
  const DEFAULT_READOUT = `28 pieces · ${PROJECTS.reduce((n, p) => n + p.media.length, 0)} plates`;

  function layout() {
    TILE_ELS.forEach(({ t, el }) => {
      el.style.width = `${t.w}px`;
      el.style.height = `${t.h}px`;
      el.style.transform = `translate3d(${t.x}px, ${t.y}px, ${t.z}px)`;
      el.dataset.projectSpotlight = state.filter === FILTERS[0] || t.p.category === state.filter ? "true" : "false";
    });
    depth.textContent = `depth ${Math.round(state.z)}mm`;
  }
  layout();

  /* drag look */
  stage.addEventListener("pointerdown", (e) => {
    if (document.body.classList.contains("is-view-open")) return;
    state.dragging = true;
    state.lastX = e.clientX; state.lastY = e.clientY;
    stage.dataset.dragging = "true";
  });
  window.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const dx = (e.clientX - state.lastX) / window.innerWidth;
    const dy = (e.clientY - state.lastY) / window.innerHeight;
    state.yawT = clamp(-YAW_MAX, YAW_MAX, state.yawT + dx * 1.15);
    state.pitchT = clamp(-PITCH_MAX, PITCH_MAX, state.pitchT - dy * 0.6);
    state.lastX = e.clientX; state.lastY = e.clientY;
  }, { passive: true });
  window.addEventListener("pointerup", () => {
    state.dragging = false;
    stage.dataset.dragging = "false";
  });
  window.addEventListener("pointercancel", () => {
    state.dragging = false;
    stage.dataset.dragging = "false";
  });

  /* wheel: dolly through the archive */
  stage.addEventListener("wheel", (e) => {
    if (document.body.classList.contains("is-view-open")) return;
    e.preventDefault();
    state.zT = clamp(Z_MIN, Z_MAX, state.zT - e.deltaY * 1.35);
  }, { passive: false });
  window.addEventListener("keydown", (e) => {
    if (document.body.classList.contains("is-view-open")) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      state.zT = clamp(Z_MIN, Z_MAX, state.zT + (e.key === "ArrowUp" ? -120 : 120));
    }
    if (e.key === "ArrowLeft") state.yawT = clamp(-YAW_MAX, YAW_MAX, state.yawT - 0.12);
    if (e.key === "ArrowRight") state.yawT = clamp(-YAW_MAX, YAW_MAX, state.yawT + 0.12);
  });

  document.addEventListener("keydown", (e) => {
    if (document.body.classList.contains("is-view-open")) return;
    if (e.key === "0") setFilter(FILTERS[0]);
    if (e.key >= "1" && e.key <= "4") setFilter(FILTERS[Number(e.key)]);
  });

  function setFilter(cat) {
    state.filter = cat;
    document.querySelectorAll(".filters button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.cat === cat));
    });
    layout();
  }
  document.addEventListener("click", (e) => {
    const fb = e.target.closest(".filters button");
    if (fb) setFilter(fb.dataset.cat);
  });

  /* anchor dolly to a filter's band */
  function tick(frame) {
    state.yaw += (state.yawT - state.yaw) * 0.085;
    state.pitch += (state.pitchT - state.pitch) * 0.085;
    state.z += (state.zT - state.z) * 0.07;
    const idleSway = state.dragging || document.body.classList.contains("is-view-open") ? 0 : Math.sin(frame * 0.00035) * 0.015;
    world.style.transform =
      `translateZ(${-state.z}px) rotateX(${-(state.pitch + idleSway)}rad) rotateY(${-(state.yaw)}rad)`;
  }

  function arrival() {
    state.ready = true;
    /* tiles arrive in a wave from the centre out */
    TILE_ELS.forEach(({ el }, i) => {
      const delay = (i % 7) * 0.05 + Math.floor(i / 7) * 0.12;
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.01, delay: i * 0 + delay, immediateRender: false });
      gsap.fromTo(el.querySelector(".tile__surface"),
        { scale: 1.3 },
        { scale: 0.985, duration: 1.1, delay: 0.3 + delay, ease: "power3.out" });
    });
  }

  return { tick, setFilter, arrival, layout };
}
