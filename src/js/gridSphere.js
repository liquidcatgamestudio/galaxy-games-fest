// gridSphere.js – glowing wireframe sphere at page center
(() => {
  "use strict";

  const canvas = document.getElementById("gridSphere");
  if (!canvas) {
    console.warn("gridSphere: #gridSphere not found – aborting");
    return;
  }

  const ctx = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let dpr = window.devicePixelRatio || 1;
  let size = 0;
  let rotationY = 0;

  const CONFIG = {
    sizeFactor: 8,
    meridians: 12,
    parallels: 8,
    tiltX: (15 * Math.PI) / 180,
    rotationSpeed: (1 * Math.PI) / 40, // one full turn ~40s
    perspective: 2.8,
    lineAlpha: 0.5,
    shadowBlur: 12,
    colorOrange: [255, 130, 45],
    colorBlue: [90, 195, 255],
  };

  function lerpColor(a, b, t) {
    return a.map((c, i) => Math.round(c + (b[i] - c) * t));
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    size = Math.min(window.innerWidth, window.innerHeight) * CONFIG.sizeFactor;

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildSpherePoints() {
    const points = [];
    const { meridians, parallels } = CONFIG;

    for (let lat = 0; lat <= parallels; lat++) {
      const phi = (lat / parallels) * Math.PI;
      const ring = [];
      for (let lon = 0; lon < meridians; lon++) {
        const theta = (lon / meridians) * Math.PI * 2;
        ring.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta),
        });
      }
      points.push(ring);
    }

    const meridianLines = [];
    for (let lon = 0; lon < meridians; lon++) {
      const line = [];
      for (let lat = 0; lat <= parallels; lat++) {
        const phi = (lat / parallels) * Math.PI;
        const theta = (lon / meridians) * Math.PI * 2;
        line.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta),
        });
      }
      meridianLines.push(line);
    }

    return { parallels: points, meridians: meridianLines };
  }

  const sphere = buildSpherePoints();

  function rotateY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x * cos + p.z * sin,
      y: p.y,
      z: -p.x * sin + p.z * cos,
    };
  }

  function rotateX(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: p.x,
      y: p.y * cos - p.z * sin,
      z: p.y * sin + p.z * cos,
    };
  }

  function transformPoint(p) {
    let t = rotateY(p, rotationY);
    t = rotateX(t, CONFIG.tiltX);
    return t;
  }

  function project(p) {
    const scale = size * 0.42;
    const depth = CONFIG.perspective;
    const factor = scale / (p.z + depth);
    return {
      x: size / 2 + p.x * factor,
      y: size / 2 - p.y * factor,
      z: p.z,
    };
  }

  function drawLine(a, b, colorT) {
    if (a.z <= 0 || b.z <= 0) return;

    const fade = Math.min(1, (a.z + b.z) * 0.5 + 0.3);
    const alpha = CONFIG.lineAlpha * fade;
    const [r, g, bl] = lerpColor(CONFIG.colorOrange, CONFIG.colorBlue, colorT);
    ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
    ctx.shadowColor = `rgba(${r},${g},${bl},${alpha})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);

    ctx.lineWidth = 1;
    ctx.shadowBlur = CONFIG.shadowBlur;

    for (const ring of sphere.parallels) {
      const transformed = ring.map((p) => transformPoint(p));
      const projected = transformed.map((p) => project(p));
      for (let i = 0; i < projected.length; i++) {
        const j = (i + 1) % projected.length;
        const colorT = (transformed[i].x + transformed[j].x) * 0.25 + 0.5;
        drawLine(projected[i], projected[j], colorT);
      }
    }

    for (const line of sphere.meridians) {
      const transformed = line.map((p) => transformPoint(p));
      const projected = transformed.map((p) => project(p));
      for (let i = 0; i < projected.length - 1; i++) {
        const colorT = (transformed[i].x + transformed[i + 1].x) * 0.25 + 0.5;
        drawLine(projected[i], projected[i + 1], colorT);
      }
    }

    ctx.shadowBlur = 0;
  }

  let lastFrame = performance.now();

  function animate(now) {
    if (!prefersReducedMotion) {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      rotationY += CONFIG.rotationSpeed * dt;
    }
    draw();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(animate);
})();
