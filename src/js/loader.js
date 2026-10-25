import gsap from "gsap";

/* ================================================================
   The loader: an opaque boot plate first (bar + role), then it
   fades away to show the name sitting split apart (±7vh); the two
   halves converge, the hint clears, and the room is revealed.
================================================================ */
export default function runLoader(onArrive) {
  const loader = document.getElementById("loader");
  const spans = loader.querySelectorAll(".loader__name span");
  const fill = loader.querySelector(".boot-bar__fill");
  const boot = loader.querySelector(".loader__boot");
  const role = loader.querySelector(".loader__role");
  const hint = loader.querySelector(".loader__hint");

  gsap.set(hint, { opacity: 0 });
  gsap.set(spans, { yPercent: (i) => (i === 0 ? 47 : -47) });

  const tl = gsap.timeline({
    onComplete: () => {
      loader.remove();
      onArrive();
    },
  });

  tl.fromTo(fill,
    { scaleX: 0 },
    { scaleX: 1, duration: 0.95, ease: "power2.inOut" })
    .fromTo(role, { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.6")
    .to(role, { opacity: 0, duration: 0.35 }, "+=0.15")
    .to(boot, { opacity: 0, duration: 0.45, onStart: () => boot.classList.add("is-done") }, "-=0.1")
    .to(spans, { yPercent: 0, duration: 1.1, stagger: 0.04, ease: "expo.inOut" }, "-=0.2")
    .to(hint, { opacity: 1, duration: 0.3 }, "-=0.6")
    .to(hint, { opacity: 0, duration: 0.3 }, "+=0.3")
    .to(loader, { opacity: 0, duration: 0.55, ease: "power2.in" }, "-=0.05");
}
