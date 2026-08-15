// shootingStars.js – parabolic arcs across the sky
// Place after your <canvas id="starCanvas"> element.

(() => {
  "use strict";

  const canvas = document.getElementById("starCanvas");
  if (!canvas) {
    console.warn("shootingStars: #starCanvas not found – aborting");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) {
    return;
  }

  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d", { alpha: true });
  let dpr = 1;
  let width = 0;
  let height = 0;
  let running = false;
  let rafId = 0;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const lowPower =
    isMobile ||
    (typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4);

  function cappedDpr() {
    const raw = window.devicePixelRatio || 1;
    if (lowPower) return 1;
    return Math.min(raw, 1.5);
  }

  function resize() {
    dpr = cappedDpr();
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const stars = [];
  const CONFIG = {
    maxStars: lowPower ? 8 : 16,
    spawnDelayMin: 250 * 25,
    spawnDelayMax: 700 * 25,
    slowDurationMin: 1000,
    slowDurationMax: 2000,
    speedSlowMin: 0.00015,
    speedSlowMax: 0.0003,
    speedFastMin: 0.0008,
    speedFastMax: 0.0013,
    tailLength: lowPower ? 80 : 120,
    amplitudeFactor: 0.25,
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  function createStar(timeNow) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const pathLengthX = width + 200;
    const amplitude = rand(-height * CONFIG.amplitudeFactor, 0);
    const margin = Math.abs(amplitude) + 100;
    const startY = rand(margin, Math.max(margin + 1, height - margin));
    const startX = dir === 1 ? -100 : width + 100;

    stars.push({
      born: timeNow,
      slowDuration: rand(CONFIG.slowDurationMin, CONFIG.slowDurationMax),
      u: 0,
      dir,
      startX,
      startY,
      amplitude,
      pathLengthX,
      x: startX,
      y: startY,
      prevX: startX,
      prevY: startY,
      size: rand(1, 3),
      speedSlow: rand(CONFIG.speedSlowMin, CONFIG.speedSlowMax),
      speedFast: rand(CONFIG.speedFastMin, CONFIG.speedFastMax),
      remove: false,
    });
  }

  let lastSpawn = 0;
  let lastFrame = performance.now();
  let nextSpawnDelay = rand(CONFIG.spawnDelayMin, CONFIG.spawnDelayMax);

  function animate(now) {
    if (!running) return;

    const dt = Math.min(now - lastFrame, 64);
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);

    if (
      stars.length < CONFIG.maxStars &&
      now - lastSpawn > nextSpawnDelay
    ) {
      createStar(now);
      lastSpawn = now;
      nextSpawnDelay = rand(CONFIG.spawnDelayMin, CONFIG.spawnDelayMax);
    }

    for (const star of stars) {
      const age = now - star.born;
      const phaseFast = age > star.slowDuration;
      const speed = phaseFast ? star.speedFast : star.speedSlow;

      star.u += speed * dt;
      star.prevX = star.x;
      star.prevY = star.y;

      const u = star.u;
      if (u > 1.1) {
        star.remove = true;
        continue;
      }

      star.x = star.startX + star.dir * u * star.pathLengthX;
      star.y = star.startY + star.amplitude * Math.sin(u * Math.PI);

      const opacity = phaseFast
        ? Math.max(0, 1 - (u - 0.8) / 0.3)
        : Math.min(1, u / 0.3);

      const dx = star.x - star.prevX;
      const dy = star.y - star.prevY;
      const angle = Math.atan2(dy, dx);
      const tailX = star.x - Math.cos(angle) * CONFIG.tailLength;
      const tailY = star.y - Math.sin(angle) * CONFIG.tailLength;

      // Solid faded tail — no per-frame gradients or shadowBlur
      ctx.globalAlpha = opacity * 0.55;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = star.size;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    for (let i = stars.length - 1; i >= 0; --i) {
      if (stars[i].remove) stars.splice(i, 1);
    }

    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(animate);
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    ctx.clearRect(0, 0, width, height);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  start();
})();
