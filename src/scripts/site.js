/* ============================================================
   EXPOSITION ISSUE 22 — client motion (Astro)
   Lenis smooth scroll · lightweight GSAP reveals (no scroll-jacking)
   ============================================================ */
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav');
  const preloader = document.getElementById('preloader');
  const progressFill = document.getElementById('progressFill');

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

  /* Contact form (in-page) */
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

  /* Nav inversion helper */
  function navInkList(y) {
    let inv = false;
    document.querySelectorAll('[data-ground="ink"]').forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= y && r.bottom >= y) inv = true;
    });
    return inv;
  }

  /* ---------- Reduced motion / no-JS-heavy fallback ---------- */
  if (reduceMotion) {
    document.documentElement.classList.add('no-motion');
    if (preloader) preloader.remove();
    document.querySelectorAll('.foil-num[data-count]').forEach((el) => { el.textContent = el.getAttribute('data-count'); });
    scrollProgress();
    const upd = () => { nav.classList.toggle('nav--ink', navInkList(48)); scrollProgress(); };
    window.addEventListener('scroll', upd, { passive: true });
    upd(); bindForm();
    return;
  }

  /* ---------- Lenis smooth scroll ---------- */
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

  /* ---------- Preloader (one-shot, cheap) ---------- */
  lenis.stop();
  const count = { v: 0 };
  const countEl = document.getElementById('preloaderCount');
  const ruleEl = document.getElementById('preloaderRule');

  let preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone) return; preloaderDone = true;
    if (preloader && preloader.parentNode) preloader.remove();
    lenis.start();
    gsap.timeline()
      .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      .to('#heroWordmark', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
      .to('#heroSub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('#heroActions', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.45');
    ScrollTrigger.refresh();
  }

  gsap.set(['#heroEyebrow', '#heroWordmark', '#heroSub', '#heroActions'], { opacity: 0, y: 24 });

  if (preloader && countEl && ruleEl) {
    const loadTl = gsap.timeline();
    loadTl.to(count, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { countEl.textContent = Math.round(count.v); } });
    loadTl.to(ruleEl, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0);
    loadTl.to(preloader.querySelector('.preloader__inner'), { opacity: 0, duration: 0.4, ease: 'power1.out' }, '+=0.15');
    loadTl.to(preloader, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, '+=0.05');
    loadTl.add(() => finishPreloader(), '-=0.3');
  } else {
    finishPreloader();
  }
  setTimeout(finishPreloader, 3500);

  /* ---------- Section fade-in reveal (IntersectionObserver — robust with Lenis) ---------- */
  const risers = document.querySelectorAll('.section__inner, .spread__inner, .colophon__inner');
  risers.forEach((el) => el.classList.add('riser'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('riser--in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  risers.forEach((el) => revealObserver.observe(el));

  /* Hairlines */
  document.querySelectorAll('[data-rule]').forEach((el) => el.classList.add('hairline--animate'));
  const ruleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('hairline--in');
        ruleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-rule]').forEach((el) => ruleObserver.observe(el));

  /* Plate parallax (kept on GSAP — inherently continuous, few elements) */
  document.querySelectorAll('[data-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Count-ups (one-shot) */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseInt(el.getAttribute('data-count'), 10);
      const obj = { v: 0 };
      gsap.to(obj, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v); } });
      countObserver.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.foil-num[data-count]').forEach((el) => countObserver.observe(el));

  /* Nav inversion */
  const inkSections = document.querySelectorAll('[data-ground="ink"]');
  function updateNavInk() { nav.classList.toggle('nav--ink', navInkList(48)); }
  const navObserver = new IntersectionObserver(updateNavInk, { threshold: [0, 1], rootMargin: '-48px 0px -100% 0px' });
  inkSections.forEach((s) => navObserver.observe(s));
  
  let lastScroll = 0;
  const handleNavScroll = () => {
    updateNavInk();
    const current = window.scrollY;
    // Hide nav while in the hero section (top 80vh)
    if (current < window.innerHeight * 0.8) {
      nav.classList.add('nav--hidden');
    } else if (current > lastScroll) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastScroll = current;
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* Progress */
  gsap.ticker.add(scrollProgress);

  /* Master Timeline Fill (Unified Journey) */
  const timelineFill = document.getElementById('timelineFill');
  const masterTimeline = document.querySelector('.master-timeline');
  if (timelineFill && masterTimeline) {
    gsap.fromTo(timelineFill, 
      { height: '0%' },
      { 
        height: '100%', 
        ease: 'none',
        scrollTrigger: {
          trigger: masterTimeline,
          start: 'top center',
          end: 'bottom center',
          scrub: true
        }
      }
    );
  }

  bindForm();
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
