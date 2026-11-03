/* ================================================================
   Time-based day/night theme.

   Uses the visitor's own browser clock (new Date().getHours()), so it
   switches at the correct local hour in every timezone.

   Day   : 06:00 — 17:59 local time
   Night : 18:00 — 05:59 local time

   The CSS lives in ./theme.css and only changes the background/text
   colours of the About page and the project/content pages.
================================================================ */
(function () {
  "use strict";

  /* Avoid running twice when the same file is also bundled from src/. */
  if (window.timeTheme) return;

  var DAY_START_HOUR = 6;   /* 06:00 */
  var NIGHT_START_HOUR = 18; /* 18:00 */
  var RECHECK_MS = 60 * 1000;
  var root = document.documentElement;
  var currentTheme = null;

  function themeForDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) date = new Date();
    var hour = date.getHours();
    return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "day" : "night";
  }

  function apply(date) {
    var next = themeForDate(date || new Date());
    if (next === currentTheme) return next;

    currentTheme = next;
    root.setAttribute("data-time-theme", next);
    root.classList.toggle("is-day-mode", next === "day");
    root.classList.toggle("is-night-mode", next === "night");

    try {
      window.dispatchEvent(new CustomEvent("timethemechange", {
        detail: { theme: next },
      }));
    } catch (err) {
      /* CustomEvent is unavailable only in very old browsers. */
    }

    return next;
  }

  /* Set the attribute immediately, before the page paints. */
  apply();

  /* Re-check every minute so the page flips exactly at the boundary,
     even if the tab is left open overnight. */
  window.setInterval(apply, RECHECK_MS);

  /* Catch tabs that were asleep/backgrounded across a boundary. */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) apply();
  });
  window.addEventListener("focus", function () { apply(); });
  window.addEventListener("pageshow", function () { apply(); });

  /* Small public hook, useful for previews and debugging. */
  window.timeTheme = {
    apply: apply,
    current: function () { return currentTheme; },
    themeForDate: themeForDate,
    dayStartHour: DAY_START_HOUR,
    nightStartHour: NIGHT_START_HOUR,
  };
})();
