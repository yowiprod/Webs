/* ============================================================
   YOWIPROD 3D SCROLL ANIMATION ENGINE
   Max FPS — Full page + section levitation + fade to black
   ============================================================ */
(function () {
  'use strict';

  var urls = window.__FRAME_DATA_URLS;
  if (!urls || !urls.length) return;

  var TOTAL_FRAMES = urls.length;
  var LERP_SPEED = 0.28;
  var images = new Array(TOTAL_FRAMES);
  var currentFrame = 0;
  var targetFrame = 0;
  var loaded = 0;
  var isReady = false;

  var loaderEl = document.getElementById('yp-loader');
  var barEl = document.getElementById('yp-loader-bar');
  var canvas = document.getElementById('yp-bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth || 1920;
    var h = window.innerHeight || 1080;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function pageScroll01() {
    var maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    return Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  }

  function getFrameScrubT() {
    return pageScroll01();
  }

  function drawFrame(img) {
    if (!img || !img.naturalWidth) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = canvas.width / dpr;
    var ch = canvas.height / dpr;
    if (cw < 10 || ch < 10) return;
    ctx.clearRect(0, 0, cw, ch);

    var p = getFrameScrubT();
    var parallaxX = Math.sin(p * Math.PI) * 8;
    var parallaxY = (p - 0.5) * 6;
    var s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    var w = Math.max(img.naturalWidth * s, cw + 2);
    var drawH = Math.max(img.naturalHeight * s, ch + 2);
    ctx.drawImage(img, (cw - w) / 2 + parallaxX, (ch - drawH) / 2 + parallaxY, w, drawH);
  }

  function onFrameLoad() {
    loaded++;
    if (barEl) barEl.style.width = (loaded / TOTAL_FRAMES * 100) + '%';
    if (loaded >= TOTAL_FRAMES) {
      isReady = true;
      if (loaderEl) {
        loaderEl.style.opacity = '0';
        loaderEl.style.transition = 'opacity 0.4s';
        setTimeout(function () { loaderEl.style.display = 'none'; }, 400);
      }
    }
  }

  for (var i = 0; i < TOTAL_FRAMES; i++) {
    images[i] = new Image();
    images[i].onload = onFrameLoad;
    images[i].onerror = onFrameLoad;
    images[i].src = urls[i];
  }

  // Collect all section inner panels for levitation
  var sectionPanels = [];
  function cacheSections() {
    sectionPanels = document.querySelectorAll(
      '.yp-path-section .yp-section-inner,' +
      '.yp-manifesto-section .yp-section-inner,' +
      '.yp-artists-section .yp-section-inner,' +
      '.yp-ht-section .yp-section-inner'
    );
  }
  // Cache after page load
  if (document.readyState === 'complete') cacheSections();
  else window.addEventListener('load', cacheSections);

  function animate() {
    if (isReady) {
      targetFrame = getFrameScrubT() * (TOTAL_FRAMES - 1);
    }

    currentFrame += (targetFrame - currentFrame) * LERP_SPEED;
    var idx = Math.round(currentFrame);
    if (idx >= 0 && idx < TOTAL_FRAMES) drawFrame(images[idx]);

    // Canvas always visible
    var bw = document.getElementById('yp-bg-wrap');
    if (bw) bw.style.opacity = '1';

    // Hero fade on scroll
    var hero = document.getElementById('yp-hero-content');
    var p = pageScroll01();
    if (hero) {
      var o = Math.max(0, 1 - p * 6.5);
      var scale = 1 - p * 0.1;
      var y = -p * 120;
      hero.style.opacity = String(o);
      hero.style.transform = 'translateY(' + y + 'px) scale(' + scale + ')';
      hero.style.pointerEvents = o < 0.08 ? 'none' : 'auto';
    }

    // FADE TO BLACK near footer (last 15% of scroll)
    var fadeEl = document.getElementById('yp-fade-to-black');
    if (fadeEl) {
      if (p > 0.85) {
        fadeEl.style.opacity = String((p - 0.85) / 0.15);
      } else {
        fadeEl.style.opacity = '0';
      }
    }

    // SECTION LEVITATION — parallax + wave float
    var st = performance.now() * 0.0015;
    var vh = window.innerHeight;
    for (var i = 0; i < sectionPanels.length; i++) {
      var s = sectionPanels[i];
      var rect = s.getBoundingClientRect();
      var inView = rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
      var dist = rect.top - vh * 0.5;
      var parallax = Math.max(-40, Math.min(40, dist * 0.08));
      var wave = Math.sin(st + i * 0.6) * 4;
      s.style.transform = 'translateY(' + (parallax + wave) + 'px) translateZ(0)';
      s.style.opacity = inView ? '1' : '0.3';
    }

    requestAnimationFrame(animate);
  }

  (function wait() {
    if (isReady) {
      animate();
    } else {
      requestAnimationFrame(wait);
    }
  })();

})();
