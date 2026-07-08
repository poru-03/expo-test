/* ============================================================
   EXPOSITION ISSUE 22 — client motion (Astro)
   Lenis smooth scroll · GSAP ScrollTrigger
   ============================================================ */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ---------- Hero gold-dust canvas ---------- */
function heroDust(reduce) {
  const canvas = document.getElementById('heroDust');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, particles = [], raf = null, running = false;
  const GOLD = ['221,196,154', '194,160,108', '174,140,100'];

  function size() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(r.width, 1); h = Math.max(r.height, 1);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    const count = Math.round(Math.min(150, (w * h) / 8500));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3, a: Math.random() * 0.5 + 0.12,
        vy: -(Math.random() * 0.24 + 0.04), vx: (Math.random() - 0.5) * 0.12,
        tw: Math.random() * Math.PI * 2, tws: Math.random() * 0.018 + 0.004,
        c: GOLD[(Math.random() * GOLD.length) | 0],
      });
    }
  }
  function draw(animated) {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      if (animated) {
        p.y += p.vy; p.x += p.vx; p.tw += p.tws;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6; else if (p.x > w + 6) p.x = -6;
      }
      const al = p.a * (animated ? (0.6 + 0.4 * Math.sin(p.tw)) : 0.72);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.c},${al.toFixed(3)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function frame() { if (!running) return; raf = requestAnimationFrame(frame); draw(true); }
  function start() { if (running || reduce) return; running = true; frame(); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  size(); seed();
  if (reduce) draw(false); else start();

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { size(); seed(); if (reduce) draw(false); }, 200); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? start() : stop())), { threshold: 0 }).observe(canvas);
  }
}

/* ---------- Video scrubber ---------- */
function makeScrubber(video, src, poster) {
  const state = { target: 0, current: 0, ready: false, failed: false };
  if (!video) { state.failed = true; state.load = () => {}; state.tick = () => {}; return state; }
  video.addEventListener('loadedmetadata', () => { state.ready = true; video.pause(); if (poster) poster.style.visibility = 'hidden'; });
  video.addEventListener('error', () => { state.failed = true; video.style.display = 'none'; });
  state.load = () => {
    if (video.dataset.loaded) return;
    video.dataset.loaded = '1';
    fetch(src).then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then((b) => { video.src = URL.createObjectURL(b); video.load(); })
      .catch(() => { video.src = src; video.load(); });
  };
  state.tick = () => {
    if (!state.ready || state.failed) return;
    const dur = video.duration;
    if (!dur || isNaN(dur)) return;
    const tt = state.target * Math.max(dur - 0.05, 0);
    state.current += (tt - state.current) * 0.14;
    if (Math.abs(video.currentTime - state.current) > 0.02) { try { video.currentTime = state.current; } catch (e) {} }
  };
  return state;
}

/* ---------- Boot ---------- */
function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  const preloader = document.getElementById('preloader');
  const progressFill = document.getElementById('progressFill');

  heroDust(reduceMotion);

  function scrollProgress() {
    if (!progressFill) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY || window.pageYOffset) / max : 0;
    progressFill.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
  }

  /* Mobile menu */
  const toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('[data-mobile-link]').forEach((a) => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* Contact form (page) */
  function bindForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.getElementById('formNote');
      const name = form.querySelector('#f-name');
      const contact = form.querySelector('#f-contact');
      const message = form.querySelector('#f-message');
      if (!name.value.trim() || !contact.value.trim() || !message.value.trim()) {
        note.textContent = 'Please fill in your name, a way to reach you, and a message.';
        (!name.value.trim() ? name : !contact.value.trim() ? contact : message).focus();
        return;
      }
      const subject = `Exposition Issue 22 — message from ${name.value.trim()}`;
      const desg = form.querySelector('#f-designation').value.trim();
      const body = `${message.value.trim()}\n\n— ${name.value.trim()}${desg ? ', ' + desg : ''}\n${contact.value.trim()}`;
      window.location.href = `mailto:exposition.uok@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Your mail client should open — the message is addressed to the editorial team.';
    });
  }

  const press = makeScrubber(document.getElementById('pressVideo'), '/assets/press.mp4', document.getElementById('pressPoster'));

  /* Nav inversion helper (shared) */
  function navInkList(y) {
    let inv = false;
    document.querySelectorAll('[data-ground="ink"]').forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) inv = true;
    });
    return inv;
  }

  /* ---------- Reduced motion ---------- */
  if (reduceMotion) {
    document.documentElement.classList.add('no-motion');
    const sv = document.getElementById('pressVideo'); if (sv) sv.remove();
    document.querySelectorAll('.foil-num[data-count]').forEach((el) => { el.textContent = el.getAttribute('data-count'); });
    if (preloader) preloader.remove();
    scrollProgress();
    const upd = () => { nav.classList.toggle('nav--ink', navInkList(48)); scrollProgress(); };
    window.addEventListener('scroll', upd, { passive: true });
    upd(); bindForm();
    return;
  }

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#top' ? -80 : -40, duration: 1.4 });
    });
  });

  /* ---------- Preloader ---------- */
  lenis.stop();
  const count = { v: 0 };
  const countEl = document.getElementById('preloaderCount');
  const ruleEl = document.getElementById('preloaderRule');

  const wm = document.getElementById('heroWordmark');
  let heroLetters = [];
  if (wm && !wm.dataset.split) {
    wm.dataset.split = '1';
    const text = wm.textContent; wm.textContent = '';
    for (const ch of text) { const s = document.createElement('span'); s.className = 'ltr'; s.textContent = ch; wm.appendChild(s); heroLetters.push(s); }
  }
  gsap.set(heroLetters, { opacity: 0, yPercent: 120 });
  gsap.set(['#heroEyebrow', '#heroMeta', '#heroCue'], { opacity: 0 });

  let preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone) return; preloaderDone = true;
    if (preloader && preloader.parentNode) preloader.remove();
    lenis.start();
    gsap.timeline()
      .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      .to(heroLetters, { opacity: 1, yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.055 }, '-=0.45')
      .to('#heroMeta', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.55')
      .to('#heroCue', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '-=0.4');
    ScrollTrigger.refresh();
  }

  if (preloader && countEl && ruleEl) {
    const loadTl = gsap.timeline();
    loadTl.to(count, { v: 100, duration: 2.1, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = Math.round(count.v); } });
    loadTl.to(ruleEl, { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, 0);
    loadTl.add(() => preloader.classList.add('is-ink'));
    loadTl.to(preloader.querySelector('.preloader__inner'), { opacity: 0, duration: 0.5, ease: 'power1.out' }, '+=0.35');
    loadTl.to(preloader, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '+=0.1');
    loadTl.add(() => finishPreloader(), '-=0.4');
  } else {
    finishPreloader();
  }
  setTimeout(finishPreloader, 6000);

  /* ---------- Hero scroll handoff ---------- */
  gsap.timeline({ scrollTrigger: { trigger: '#heroStage', start: 'top top', end: '+=100%', pin: true, scrub: true } })
    .to('.hero__content', { opacity: 0, y: -40, ease: 'none', duration: 0.55 }, 0)
    .to('.hero__ghost', { yPercent: -14, ease: 'none', duration: 1 }, 0)
    .to('.hero__dust', { opacity: 0.2, ease: 'none', duration: 1 }, 0);

  /* ---------- Horizontal story timeline ---------- */
  const track = document.getElementById('storyTrack');
  if (track) {
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth + 32),
      ease: 'none',
      scrollTrigger: {
        trigger: '#story', start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth + 32),
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
  }

  /* ---------- Launch scrub ---------- */
  ScrollTrigger.create({ trigger: '#launch', start: 'top bottom+=150%', once: true, onEnter: () => press.load() });
  gsap.timeline({ scrollTrigger: { trigger: '#launchStage', start: 'top top', end: '+=180%', pin: true, scrub: true, onUpdate: (self) => { press.target = self.progress; } } })
    .fromTo('.launch__ghost22', { yPercent: 6 }, { yPercent: -4, ease: 'none' }, 0)
    .fromTo('.launch__content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none', duration: 0.4 }, 0.45);
  gsap.ticker.add(() => press.tick());

  /* ---------- Section slide-up ---------- */
  gsap.set(document.querySelectorAll('.reveal'), { opacity: 1, y: 0 });
  const risers = document.querySelectorAll('.section__inner, .spread__inner, .colophon__inner');
  gsap.set(risers, { y: 90, opacity: 0 });
  risers.forEach((inner) => {
    gsap.to(inner, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: inner, start: 'top 85%' } });
  });

  /* Hairlines */
  document.querySelectorAll('[data-rule]').forEach((el) => {
    gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* Plate & cover parallax */
  document.querySelectorAll('[data-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Count-ups */
  document.querySelectorAll('.foil-num[data-count]').forEach((el) => {
    const end = parseInt(el.getAttribute('data-count'), 10);
    const obj = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => gsap.to(obj, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } }) });
  });

  /* Nav inversion */
  const inkTriggers = [];
  document.querySelectorAll('[data-ground="ink"]').forEach((section) => {
    inkTriggers.push(ScrollTrigger.create({ trigger: section, start: 'top 48px', end: 'bottom 48px', onToggle: updateNavInk, onRefresh: updateNavInk }));
  });
  function updateNavInk() { nav.classList.toggle('nav--ink', inkTriggers.some((t) => t.isActive)); }

  /* Progress */
  gsap.ticker.add(scrollProgress);

  bindForm();
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh());
  setTimeout(() => ScrollTrigger.refresh(), 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
