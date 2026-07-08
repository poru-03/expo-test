/* ============================================================
   EXPOSITION ISSUE 22 — motion
   Lenis smooth scroll · GSAP ScrollTrigger
   Monument hero → soft ground seams → THE PRESSING (launch scrub)
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nav = document.getElementById('nav');
  var preloader = document.getElementById('preloader');
  var progressFill = document.getElementById('progressFill');

  /* ---------------------------------------------------------
     Scroll-progress line (top edge) — shared by both modes
     --------------------------------------------------------- */
  function scrollProgress() {
    if (!progressFill) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? (window.scrollY || window.pageYOffset) / max : 0;
    progressFill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
  }

  /* ---------------------------------------------------------
     Split the hero wordmark into per-letter spans (for reveal)
     --------------------------------------------------------- */
  function splitWordmark() {
    var el = document.getElementById('heroWordmark');
    if (!el || el.dataset.split) return [];
    el.dataset.split = '1';
    var text = el.textContent;
    el.textContent = '';
    var spans = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = text[i];
      el.appendChild(s);
      spans.push(s);
    }
    return spans;
  }

  /* ---------------------------------------------------------
     Video scrubber — lerped currentTime driven by progress
     --------------------------------------------------------- */
  function makeScrubber(video, src, poster) {
    var state = { target: 0, current: 0, ready: false, failed: false };
    if (!video) {
      state.failed = true;
      state.load = function () {};
      state.tick = function () {};
      return state;
    }

    video.addEventListener('loadedmetadata', function () {
      state.ready = true;
      video.pause();
      if (poster) poster.style.visibility = 'hidden';
    });
    video.addEventListener('error', function () {
      state.failed = true;
      video.style.display = 'none';
    });

    state.load = function () {
      if (video.dataset.loaded) return;
      video.dataset.loaded = '1';
      /* fetch as a blob so the whole clip is seekable */
      fetch(src).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      }).then(function (b) {
        video.src = URL.createObjectURL(b);
        video.load();
      }).catch(function () {
        video.src = src;
        video.load();
      });
    };

    state.tick = function () {
      if (!state.ready || state.failed) return;
      var dur = video.duration;
      if (!dur || isNaN(dur)) return;
      var t = state.target * Math.max(dur - 0.05, 0);
      state.current += (t - state.current) * 0.14;
      if (Math.abs(video.currentTime - state.current) > 0.02) {
        try { video.currentTime = state.current; } catch (e) { /* seek not ready */ }
      }
    };
    return state;
  }

  var press = makeScrubber(document.getElementById('pressVideo'), 'assets/press.mp4', document.getElementById('pressPoster'));

  /* ---------------------------------------------------------
     Reduced motion — stills, static everything, honest fallback
     --------------------------------------------------------- */
  if (reduceMotion) {
    document.documentElement.classList.add('no-motion');
    var sv = document.getElementById('pressVideo');
    if (sv) sv.remove();
    document.querySelectorAll('.foil-num[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
    if (preloader) preloader.remove();
    scrollProgress();
    window.addEventListener('scroll', scrollProgress, { passive: true });
    window.addEventListener('resize', scrollProgress);
    bindNavInversionSimple();
    bindForm();
    return;
  }

  /* ---------------------------------------------------------
     Lenis smooth scroll
     --------------------------------------------------------- */
  var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  /* Anchor navigation through Lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#top' ? -80 : -40, duration: 1.4 });
    });
  });

  /* ---------------------------------------------------------
     Preloader — Bodoni counter over a drawing foil rule,
     inverts to ink at 100, then the monument is revealed
     --------------------------------------------------------- */
  lenis.stop();

  var count = { v: 0 };
  var countEl = document.getElementById('preloaderCount');
  var ruleEl = document.getElementById('preloaderRule');
  var heroLetters = splitWordmark();
  /* keep the masthead hidden until the intro plays */
  gsap.set(heroLetters, { opacity: 0, yPercent: 120 });
  gsap.set(['#heroEyebrow', '#heroMeta', '#heroCue'], { opacity: 0 });

  var loadTl = gsap.timeline();
  loadTl.to(count, {
    v: 100,
    duration: 2.1,
    ease: 'power2.inOut',
    onUpdate: function () { countEl.textContent = Math.round(count.v); }
  });
  loadTl.to(ruleEl, { scaleX: 1, duration: 2.1, ease: 'power2.inOut' }, 0);
  loadTl.add(function () { preloader.classList.add('is-ink'); });
  loadTl.to(preloader.querySelector('.preloader__inner'), { opacity: 0, duration: 0.5, ease: 'power1.out' }, '+=0.35');
  loadTl.to(preloader, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '+=0.1');
  loadTl.add(function () { finishPreloader(); }, '-=0.4');

  var preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    if (preloader && preloader.parentNode) preloader.remove();
    lenis.start();
    heroIntro();
  }
  /* rAF can be throttled in background tabs — never trap the visitor */
  setTimeout(finishPreloader, 6000);

  /* ---------------------------------------------------------
     Hero intro — eyebrow, per-letter masthead, meta, cue
     --------------------------------------------------------- */
  function heroIntro() {
    gsap.timeline()
      .to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
      .to(heroLetters, { opacity: 1, yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.055 }, '-=0.45')
      .to('#heroMeta', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.55')
      .to('#heroCue', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '-=0.4');
  }

  /* Hero scroll handoff — content recedes, the ghost 22 drifts */
  gsap.timeline({
    scrollTrigger: { trigger: '#heroStage', start: 'top top', end: '+=100%', pin: true, scrub: true }
  })
    .to('.hero__content', { opacity: 0, y: -40, ease: 'none', duration: 0.55 }, 0)
    .to('.hero__ghost', { yPercent: -14, ease: 'none', duration: 1 }, 0)
    .to('.hero__dust', { opacity: 0.2, ease: 'none', duration: 1 }, 0);

  /* ---------------------------------------------------------
     LAUNCH — THE PRESSING (pinned scrub, lazy-loaded)
     --------------------------------------------------------- */
  ScrollTrigger.create({
    trigger: '#launch',
    start: 'top bottom+=150%',
    once: true,
    onEnter: function () { press.load(); }
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: '#launchStage',
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: true,
      onUpdate: function (self) { press.target = self.progress; }
    }
  })
    .fromTo('.launch__ghost22', { yPercent: 6 }, { yPercent: -4, ease: 'none' }, 0)
    .fromTo('.launch__content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'none', duration: 0.4 }, 0.45);

  gsap.ticker.add(function () { press.tick(); });

  /* ---------------------------------------------------------
     Section slide-up — each panel rises into place as one
     gesture (the content handles motion; the crisp colour line
     stays put). Individual .reveal elements ride along.
     --------------------------------------------------------- */
  gsap.set(document.querySelectorAll('.reveal'), { opacity: 1, y: 0 });

  var risers = document.querySelectorAll('.section__inner, .spread__inner, .colophon__inner');
  gsap.set(risers, { y: 90, opacity: 0 });
  risers.forEach(function (inner) {
    gsap.to(inner, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: inner, start: 'top 85%' }
    });
  });

  document.querySelectorAll('[data-rule]').forEach(function (el) {
    gsap.from(el, {
      scaleX: 0,
      transformOrigin: 'left center',
      duration: 1.1,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* Plate & cover parallax — slow, restrained */
  document.querySelectorAll('[data-parallax] img').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* Stats count-up in Bodoni foil numerals */
  document.querySelectorAll('.foil-num[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: end,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.v); }
        });
      }
    });
  });

  /* ---------------------------------------------------------
     Nav inversion over ink chapters
     --------------------------------------------------------- */
  var inkTriggers = [];
  document.querySelectorAll('[data-ground="ink"]').forEach(function (section) {
    inkTriggers.push(ScrollTrigger.create({
      trigger: section,
      start: 'top 48px',
      end: 'bottom 48px',
      onToggle: updateNavInk,
      onRefresh: updateNavInk
    }));
  });
  function updateNavInk() {
    var active = inkTriggers.some(function (t) { return t.isActive; });
    nav.classList.toggle('nav--ink', active);
  }

  /* ---------------------------------------------------------
     Scroll progress line
     --------------------------------------------------------- */
  gsap.ticker.add(scrollProgress);

  ScrollTrigger.refresh();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ---------------------------------------------------------
     Contact form
     --------------------------------------------------------- */
  bindForm();

  /* ============================================================ */

  function bindForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      var name = form.querySelector('#f-name');
      var contact = form.querySelector('#f-contact');
      var message = form.querySelector('#f-message');
      if (!name.value.trim() || !contact.value.trim() || !message.value.trim()) {
        note.textContent = 'Please fill in your name, a way to reach you, and a message.';
        (!name.value.trim() ? name : !contact.value.trim() ? contact : message).focus();
        return;
      }
      var subject = 'Exposition Issue 22 — message from ' + name.value.trim();
      var body = message.value.trim() + '\n\n— ' + name.value.trim() +
        (form.querySelector('#f-designation').value.trim() ? ', ' + form.querySelector('#f-designation').value.trim() : '') +
        '\n' + contact.value.trim();
      window.location.href = 'mailto:info@exposition.lk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Your mail client should open — the message is addressed to the editorial team.';
    });
  }

  /* Reduced-motion nav inversion via scroll listener */
  function bindNavInversionSimple() {
    function update() {
      var y = 48;
      var inv = false;
      document.querySelectorAll('[data-ground="ink"]').forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) inv = true;
      });
      nav.classList.toggle('nav--ink', inv);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
})();
