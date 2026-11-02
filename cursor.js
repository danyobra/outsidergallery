/* Custom cursor: precise centre dot + smoothly lagging outer ring. */
(function () {
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  var root = document.documentElement;
  var dot = document.createElement("div");
  var ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  root.classList.add("has-cursor");

  var mx = -100, my = -100, rx = -100, ry = -100, seen = false;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ease = reduce ? 1 : 0.16;

  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    dot.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
    if (!seen) { seen = true; rx = mx; ry = my; root.classList.add("cursor-on"); }
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * ease;
    ry += (my - ry) * ease;
    ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
    requestAnimationFrame(loop);
  })();

  var hoverSel = "a,button,[role=button],.tile,[data-go],[data-go-view],input,textarea,select,label";
  document.addEventListener("pointerover", function (e) {
    root.classList.toggle("cursor-hover", !!(e.target.closest && e.target.closest(hoverSel)));
  }, { passive: true });
  window.addEventListener("pointerdown", function () { root.classList.add("cursor-down"); });
  window.addEventListener("pointerup", function () { root.classList.remove("cursor-down"); });
  document.addEventListener("mouseleave", function () { root.classList.remove("cursor-on"); });
  document.addEventListener("mouseenter", function () { if (seen) root.classList.add("cursor-on"); });
})();
