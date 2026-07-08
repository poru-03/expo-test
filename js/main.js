/* ============================================================
   EXPOSITION ISSUE 22 — motion
   Lenis smooth scroll · GSAP ScrollTrigger
   THE POUR (hero scrub) → thread → THE PRESSING (launch scrub)
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;

  var nav = document.getElementById('nav');
  var thread = document.getElementById('thread');
  var threadTrack = document.getElementById('threadTrack');
  var threadFill = document.getElementById('threadFill');
  var preloader = document.getElementById('preloader');

  var GOLD_PAPER = '#AE8C64'; /* gold 500 on paper */
  var GOLD_INK = '#DDC49A';   /* gold 200 over ink */

  /* ---------------------------------------------------------
     Video scrubber — lerped currentTime driven by progress
     --------------------------------------------------------- */
  function makeScrubber(video, src, poster) {
    var state = { target: 0, current: 0, ready: false, failed: false };
    if (!video) { state.failed = true; return state; }

    video.addEventListener('loadedmetadata', function () {
      state.ready = true;
      video.pause();
      /* the still is only a fallback — the scrub owns the frame now */
      if (poster) poster.style.visibility = 'hidden';
    });
    video.addEventListener('error', function () {
      state.failed = true;
      video.style.display = 'none';
    });

    state.load = function () {
      if (video.dataset.loaded) return;
      video.dataset.loaded = '1';
      /* fetch as a blob so the whole clip is seekable — scrubbing needs
         byte-range freedom that simple static servers don't provide */
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

  var pour = makeScrubber(document.getElementById('pourVideo'), 'assets/pour.mp4', document.getElementById('pourPoster'));
  var press = makeScrubber(document.getElementById('pressVideo'), 'assets/press.mp4', document.getElementById('pressPoster'));

  /* ---------------------------------------------------------
     Reduced motion — stills, static thread, everything intact
     --------------------------------------------------------- */
  if (reduceMotion) {
    document.documentElement.classList.add('no-motion');
    var pv = document.getElementById('pourVideo');
    var sv = document.getElementById('pressVideo');
    if (pv) pv.remove();
    if (sv) sv.remove();
    document.querySelectorAll('.foil-num[data-count]').forEach(function (el) {
      el.textContent = el.getAttribute('data-count');
    });
    if (preloader) preloader.remove();
    layoutThread(true);
    window.addEventListener('resize', function () { layoutThread(true); });
    bindNavInversionSimple();
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
     inverts to ink at 100, then the pour is revealed
     --------------------------------------------------------- */
  lenis.stop();
  pour.load();

  var count = { v: 0 };
  var countEl = document.getElementById('preloaderCount');
  var ruleEl = document.getElementById('preloaderRule');

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
  loadTl.add(function () {
    finishPreloader();
  }, '-=0.4');

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
     Hero intro — the page answers "what is this?" unprompted
     --------------------------------------------------------- */
  function heroIntro() {
    gsap.timeline()
      .from('#heroWordmark', { opacity: 0, y: 24, duration: 1.1, ease: 'power3.out' })
      .from('#heroTagline', { opacity: 0, y: 14, duration: 0.9, ease: 'power3.out' }, '-=0.7')
      .to('#heroPosition', { opacity: 1, duration: 1.0, ease: 'power2.out' }, '-=0.35')
      .to('#heroActions', { opacity: 1, duration: 1.0, ease: 'power2.out' }, '-=0.6');
  }

  /* ---------------------------------------------------------
     HERO — THE POUR (pinned scrub)
     --------------------------------------------------------- */
  var heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#heroStage',
      start: 'top top',
      end: '+=220%',
      pin: true,
      scrub: true,
      onUpdate: function (self) {
        /* video runs through the first 78% of the pin */
        pour.target = Math.min(self.progress / 0.78, 1);
      }
    }
  });

  /* impact-and-bloom: ghost 22 swells slightly with the strike */
  heroTl.fromTo('.hero__ghost22', { scale: 0.96 }, { scale: 1.03, ease: 'none', duration: 0.7 }, 0);
  /* the pour narrows — freeze and cross-fade beneath the live hairline */
  heroTl.to('#pourVideo', { opacity: 0, ease: 'none', duration: 0.16 }, 0.8);
  heroTl.fromTo('#heroHandoff', { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 0.2 }, 0.78);
  /* content recedes as the chapter closes */
  heroTl.to('.hero__content', { opacity: 0, y: -40, ease: 'none', duration: 0.25 }, 0.72);

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

  /* video seek loop */
  gsap.ticker.add(function () { pour.tick(); press.tick(); });

  /* ---------------------------------------------------------
     Reveals — a fade-up and a hairline drawing in, nothing more
     --------------------------------------------------------- */
  document.querySelectorAll('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
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

  /* Plate parallax — slow, restrained */
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
     THE THREAD — one continuous foil hairline, hero → contact,
     doubling as the scroll-progress indicator.
     gold 500 on paper · gold 200 over ink.
     --------------------------------------------------------- */
  var threadMeta = { top: 0, len: 1 };

  function layoutThreadAndProgress() {
    threadMeta = layoutThread(false);
  }

  ScrollTrigger.addEventListener('refresh', layoutThreadAndProgress);

  gsap.ticker.add(function () {
    if (!threadMeta.len) return;
    var pen = window.scrollY + window.innerHeight * 0.55;
    var p = (pen - threadMeta.top) / threadMeta.len;
    p = Math.max(0, Math.min(1, p));
    threadFill.style.transform = 'scaleY(' + p + ')';
  });

  ScrollTrigger.refresh();
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  /* ---------------------------------------------------------
     Contact form — front-end only, honest about it
     --------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
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

  /* ============================================================ */

  /* Thread layout — shared by both motion modes */
  function layoutThread(staticFill) {
    var hero = document.getElementById('hero');
    var formEl = document.getElementById('contactForm');
    if (!hero || !formEl) return { top: 0, len: 0 };

    var heroRect = hero.getBoundingClientRect();
    var formRect = formEl.getBoundingClientRect();
    var scrollY = window.scrollY || window.pageYOffset;

    var top = heroRect.bottom + scrollY;
    var end = formRect.top + scrollY + 24; /* the last inch draws into the form */
    var len = Math.max(end - top, 0);

    thread.style.top = top + 'px';
    thread.style.height = len + 'px';

    /* gradient with hard stops: gold-500 on paper, gold-200 over ink */
    var stops = ['' + GOLD_PAPER + ' 0%'];
    document.querySelectorAll('[data-ground="ink"]').forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      var a = ((r.top + scrollY - top) / len) * 100;
      var b = ((r.bottom + scrollY - top) / len) * 100;
      if (b < 0 || a > 100) return;
      a = Math.max(0, Math.min(100, a));
      b = Math.max(0, Math.min(100, b));
      stops.push(GOLD_PAPER + ' ' + a + '%');
      stops.push(GOLD_INK + ' ' + a + '%');
      stops.push(GOLD_INK + ' ' + b + '%');
      stops.push(GOLD_PAPER + ' ' + b + '%');
    });
    stops.push(GOLD_PAPER + ' 100%');
    var grad = 'linear-gradient(to bottom, ' + stops.join(', ') + ')';
    threadTrack.style.background = grad;
    threadFill.style.background = grad;

    if (staticFill) threadFill.style.transform = 'scaleY(1)';

    return { top: top, len: len };
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
