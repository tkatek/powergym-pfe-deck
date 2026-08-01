/* ============================================================
   POWERGYM PRO — PFE DEFENSE DECK — Controller
   ============================================================ */

(function(){
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  let current = 0;
  let animating = false;

  const deck = document.getElementById("deck");
  const progressBar = document.getElementById("progressBar");
  const counterCurrent = document.getElementById("counterCurrent");
  const counterTotal = document.getElementById("counterTotal");
  const slideTitleTag = document.getElementById("slideTitleTag");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const sideNav = document.getElementById("sideNav");
  const hexfield = document.getElementById("hexfield");

  counterTotal.textContent = String(total).padStart(2, "0");

  /* ---------------- build side nav dots ---------------- */
  slides.forEach((s, i) => {
    const dot = document.createElement("button");
    dot.className = "nav-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", s.dataset.title || ("Diapositive " + (i+1)));
    dot.addEventListener("click", () => goTo(i));
    sideNav.appendChild(dot);
  });
  const dots = Array.from(sideNav.querySelectorAll(".nav-dot"));

  /* ---------------- initial state ---------------- */
  slides.forEach((s, i) => { if (i !== 0) s.style.display = "none"; });
  slides[0].classList.add("active");

  function formatNum(n){ return String(n).padStart(2, "0"); }

  /* ---------------- counters (data-count) ---------------- */
  function playCounters(slide){
    const nums = slide.querySelectorAll("[data-count]");
    nums.forEach(el => {
      const target = parseFloat(el.getAttribute("data-count"));
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        delay: 0.25,
        onUpdate: () => {
          el.textContent = prefix + Math.round(obj.val).toLocaleString("fr-FR") + suffix;
        }
      });
    });
  }

  /* ---------------- reveal animation for a slide's content ---------------- */
  function revealSlide(slide){
    const items = slide.querySelectorAll(".reveal");
    gsap.killTweensOf(items);
    gsap.set(items, { opacity: 0, y: 26 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.15
    });
    playCounters(slide);
  }

  /* ---------------- navigation core ---------------- */
  function goTo(index, direction){
    if (index === current || index < 0 || index >= total || animating) return;
    direction = direction || (index > current ? 1 : -1);
    animating = true;

    const outgoing = slides[current];
    const incoming = slides[index];

    incoming.style.display = "flex";
    gsap.set(incoming, { opacity: 0, x: direction * 60 });
    incoming.classList.add("active");

    const tl = gsap.timeline({
      onComplete: () => {
        outgoing.classList.remove("active");
        outgoing.style.display = "none";
        animating = false;
      }
    });

    tl.to(outgoing, { opacity: 0, x: direction * -60, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(incoming, { opacity: 1, x: 0, duration: 0.65, ease: "power3.out" }, 0.08);

    current = index;
    updateChrome();
    revealSlide(incoming);
  }

  function updateChrome(){
    progressBar.style.width = ((current + 1) / total * 100) + "%";
    counterCurrent.textContent = formatNum(current + 1);
    slideTitleTag.textContent = slides[current].dataset.title || "";
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function next(){ if (current < total - 1) goTo(current + 1, 1); }
  function prev(){ if (current > 0) goTo(current - 1, -1); }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  /* ---------------- keyboard ---------------- */
  window.addEventListener("keydown", (e) => {
    if (["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){ e.preventDefault(); next(); }
    else if (["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){ e.preventDefault(); prev(); }
    else if (e.key === "Home"){ goTo(0, -1); }
    else if (e.key === "End"){ goTo(total - 1, 1); }
  });

  /* ---------------- wheel (throttled) ---------------- */
  let wheelLock = false;
  window.addEventListener("wheel", (e) => {
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 24) return;
    wheelLock = true;
    if (e.deltaY > 0) next(); else prev();
    setTimeout(() => { wheelLock = false; }, 700);
  }, { passive: true });

  /* ---------------- touch swipe ---------------- */
  let touchStartX = 0, touchStartY = 0;
  window.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ---------------- ambient hex parallax ---------------- */
  const quickX = gsap.quickTo(hexfield, "x", { duration: 1.2, ease: "power3.out" });
  const quickY = gsap.quickTo(hexfield, "y", { duration: 1.2, ease: "power3.out" });
  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    quickX(nx * -18);
    quickY(ny * -18);
  });

  /* ---------------- initial reveal ---------------- */
  window.addEventListener("load", () => {
    updateChrome();
    revealSlide(slides[0]);
    gsap.from(".chrome-top", { opacity: 0, y: -16, duration: 0.8, ease: "power2.out", delay: 0.1 });
    gsap.from(".chrome-bottom", { opacity: 0, y: 16, duration: 0.8, ease: "power2.out", delay: 0.2 });
    gsap.from(".side-nav", { opacity: 0, x: 12, duration: 0.8, ease: "power2.out", delay: 0.3 });
    gsap.from(".progress-rail", { opacity: 0, duration: 0.6, delay: 0.1 });
  });

})();
