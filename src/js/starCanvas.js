// shootingStars.js – parabolic arcs across the sky 🌌✨
// Place after your <canvas id="starCanvas"> element.

(() => {
  "use strict";

  /* --------------------------------------------------
     Canvas setup
  -------------------------------------------------- */
  const canvas = document.getElementById("starCanvas");
  if (!canvas) {
    console.warn("shootingStars: #starCanvas not found – aborting ✨");
    return;
  }

  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext("2d");
  let dpr = window.devicePixelRatio || 1;
  let width, height;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* --------------------------------------------------
     Star model & config
  -------------------------------------------------- */
  const stars = [];
  const CONFIG = {
    maxStars: 120,
    spawnDelayMin: 250 * 25,
    spawnDelayMax: 700 * 25,
    slowDurationMin: 1000, // ms before the burst
    slowDurationMax: 2000,
    speedSlowMin: 0.00015, // progress units / ms (0→1)
    speedSlowMax: 0.0003,
    speedFastMin: 0.0008,
    speedFastMax: 0.0013,
    tailLength: 140, // super‑long tails
    amplitudeFactor: 0.25, // how tall the arc is, relative to viewport height
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  /**
   * Create a star that will follow a shallow parabolic arc across the viewport.
   */
  function createStar(timeNow) {
    const dir = Math.random() < 0.5 ? 1 : -1; // 1 = left→right, -1 = right→left
    const pathLengthX = width + 200; // travel extra past edges
    const amplitude = rand(-height * CONFIG.amplitudeFactor, 0);

    // Ensure startY keeps the arc safely in view
    const margin = Math.abs(amplitude) + 100;
    const startY = rand(margin, height - margin);

    const startX = dir === 1 ? -100 : width + 100;

    stars.push({
      born: timeNow,
      slowDuration: rand(CONFIG.slowDurationMin, CONFIG.slowDurationMax),
      u: 0, // 0 → 1 progress
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

  /* --------------------------------------------------
     Animation loop
  -------------------------------------------------- */
  let lastSpawn = 0;
  let lastFrame = performance.now();

  function animate(now) {
    const dt = now - lastFrame;
    lastFrame = now;

    ctx.clearRect(0, 0, width, height);

    // Spawn new stars
    if (
      stars.length < CONFIG.maxStars &&
      now - lastSpawn > rand(CONFIG.spawnDelayMin, CONFIG.spawnDelayMax)
    ) {
      createStar(now);
      lastSpawn = now;
    }

    // Update & draw
    for (const star of stars) {
      const age = now - star.born;
      const phaseFast = age > star.slowDuration;
      const speed = phaseFast ? star.speedFast : star.speedSlow;

      star.u += speed * dt;

      star.prevX = star.x;
      star.prevY = star.y;

      // Parametric path
      const u = star.u;
      if (u > 1.1) {
        star.remove = true;
        continue;
      }

      star.x = star.startX + star.dir * u * star.pathLengthX;
      star.y = star.startY + star.amplitude * Math.sin(u * Math.PI);

      // Drawing
      ctx.save();
      const opacity = phaseFast ? Math.max(0, 1 - (u - 0.8) / 0.3) : Math.min(1, u / 0.3);
      ctx.globalAlpha = opacity;

      // Tail along instantaneous direction
      const dx = star.x - star.prevX;
      const dy = star.y - star.prevY;
      const angle = Math.atan2(dy, dx);
      ctx.lineWidth = star.size;
      const tailX = star.x - Math.cos(angle) * CONFIG.tailLength;
      const tailY = star.y - Math.sin(angle) * CONFIG.tailLength;
      const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      // Head
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Remove old stars
    for (let i = stars.length - 1; i >= 0; --i) if (stars[i].remove) stars.splice(i, 1);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
