/* ============================================================
   EXPOSITION ISSUE 22 — Hero atmosphere
   A lightweight 2D canvas gold-dust field behind the monument.
   No external dependency; pauses when the hero leaves view.
   ============================================================ */

(function () {
  'use strict';

  var canvas = document.getElementById('heroDust');
  if (!canvas || !canvas.getContext) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, particles = [], raf = null, running = false;

  /* gold-200 / gold-400 / gold-500 as rgb triplets */
  var GOLD = ['221,196,154', '194,160,108', '174,140,100'];

  function size() {
    var r = canvas.getBoundingClientRect();
    w = Math.max(r.width, 1);
    h = Math.max(r.height, 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    var count = Math.round(Math.min(150, (w * h) / 8500));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.5 + 0.12,
        vy: -(Math.random() * 0.24 + 0.04),
        vx: (Math.random() - 0.5) * 0.12,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.018 + 0.004,
        c: GOLD[(Math.random() * GOLD.length) | 0]
      });
    }
  }

  function draw(animated) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (animated) {
        p.y += p.vy;
        p.x += p.vx;
        p.tw += p.tws;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6; else if (p.x > w + 6) p.x = -6;
      }
      var al = p.a * (animated ? (0.6 + 0.4 * Math.sin(p.tw)) : 0.72);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + p.c + ',' + al.toFixed(3) + ')';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    draw(true);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    frame();
  }
  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  size();
  seed();

  if (reduce) {
    draw(false);
  } else {
    start();
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      size();
      seed();
      if (reduce) draw(false);
    }, 200);
  });

  /* Don't burn cycles once the hero has scrolled away */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0 }).observe(canvas);
  }
})();
