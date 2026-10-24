/**
 * about-play.js — the playable parts of the About page.
 *
 * DOCUMENTED PROGRESSIVE ENHANCEMENT (see AGENTS.md): the page is complete
 * without this file; it only adds the two experiments. Vanilla canvas 2D,
 * no dependencies (p5.js would be ~1 MB for the same thing), one
 * requestAnimationFrame loop shared by both widgets, paused off-screen.
 *
 *   1. NEWTON'S CRADLE — five pendulums with real momentum transfer
 *      (equal masses, elastic collisions: velocity swaps on contact).
 *      Each ball carries one of the association's values. Drag a ball and
 *      release it.
 *
 *   2. ERLENMEYERS — five flasks in the brand colours (one per body of the
 *      association). Drag one over another and it pours: levels change and
 *      the colours mix by volume. Red + yellow really makes orange.
 */
(() => {
  'use strict';

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const G = 1400; // gravity, px/s^2 — tuned to the drawing scale
  const widgets = [];

  /* ------------------------------------------------------------ helpers */
  function fit(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (canvas.width !== w * DPR || canvas.height !== h * DPR) {
      canvas.width = w * DPR;
      canvas.height = h * DPR;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { ctx, w, h };
  }

  function shade(c, k) {
    const m = String(c).match(/\d+/g);
    if (!m) return c;
    return `rgb(${Math.round(m[0] * k)},${Math.round(m[1] * k)},${Math.round(m[2] * k)})`;
  }

  function pointer(canvas, ev) {
    const r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  /* ====================================================== NEWTON'S CRADLE */
  class Cradle {
    constructor(canvas) {
      this.canvas = canvas;
      this.labels = (canvas.dataset.labels || '').split('|');
      this.colors = (canvas.dataset.colors || '').split('|');
      this.n = this.labels.length;
      this.theta = new Float64Array(this.n);
      this.omega = new Float64Array(this.n);
      this.drag = -1;
      this.last = null;
      // start with the left ball raised — the classic opening move
      this.theta[0] = -1.05;
      canvas.addEventListener('pointerdown', (e) => this.down(e));
      canvas.addEventListener('pointermove', (e) => this.move(e));
      canvas.addEventListener('pointerup', (e) => this.up(e));
      canvas.addEventListener('pointercancel', (e) => this.up(e));
    }

    geom(w, h) {
      const r = Math.min(w / (this.n * 2.6), h / 4.6);
      const len = Math.min(h * 0.55, w * 0.5);
      return { r, len, cx: w / 2, cy: h * 0.16 };
    }

    ballPos(i, w, h) {
      const { r, len, cx, cy } = this.geom(w, h);
      const x = cx + (i - (this.n - 1) / 2) * 2.02 * r + len * Math.sin(this.theta[i]);
      const y = cy + len * Math.cos(this.theta[i]);
      return { x, y, r };
    }

    down(e) {
      const { w, h } = fit(this.canvas);
      const p = pointer(this.canvas, e);
      for (let i = 0; i < this.n; i++) {
        const b = this.ballPos(i, w, h);
        if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.6) {
          this.drag = i;
          this.last = p;
          this.omega[i] = 0;
          this.canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    }

    move(e) {
      if (this.drag < 0) return;
      const { w, h } = fit(this.canvas);
      const p = pointer(this.canvas, e);
      const { cx, cy } = this.geom(w, h);
      const i = this.drag;
      const bx = cx + (i - (this.n - 1) / 2) * 2.02 * this.geom(w, h).r;
      const ang = Math.atan2(p.x - bx, Math.max(1, p.y - cy));
      this.omega[i] = (ang - this.theta[i]) * 12;
      this.theta[i] = Math.max(-1.35, Math.min(1.35, ang));
      this.last = p;
    }

    up() {
      this.drag = -1;
    }

    step(dt) {
      const { w, h } = fit(this.canvas);
      const { r, len } = this.geom(w, h);
      const sub = 4;
      void len;
      const h2 = dt / sub;
      for (let s = 0; s < sub; s++) {
        for (let i = 0; i < this.n; i++) {
          if (i === this.drag) continue;
          this.omega[i] += (-(G / len) * Math.sin(this.theta[i])) * h2;
          this.omega[i] *= 0.9994;
          this.theta[i] += this.omega[i] * h2;
        }
        // elastic collisions between neighbours: equal masses swap velocity
        for (let pass = 0; pass < 3; pass++) {
          for (let i = 0; i < this.n - 1; i++) {
            const a = this.ballPos(i, w, h);
            const b = this.ballPos(i + 1, w, h);
            const gap = Math.abs(b.x - a.x);
            if (gap <= 2 * r + 0.5) {
              const va = this.omega[i];
              const vb = this.omega[i + 1];
              if (va > vb) {
                this.omega[i] = vb;
                this.omega[i + 1] = va;
                // separate so they do not stick
                const push = (2 * r + 0.5 - gap) / 2 / len;
                if (i !== this.drag) this.theta[i] -= push;
                if (i + 1 !== this.drag) this.theta[i + 1] += push;
              }
            }
          }
        }
      }
    }

    draw() {
      const { ctx, w, h } = fit(this.canvas);
      const { r, cx, cy } = this.geom(w, h);
      const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      ctx.clearRect(0, 0, w, h);
      const barY = cy - 6;
      const span = w * 0.34;

      // the floor shadow
      const floor = cy + this.geom(w, h).len + r * 1.35;
      const shadow = ctx.createLinearGradient(0, floor - 8, 0, floor + 8);
      shadow.addColorStop(0, 'transparent');
      shadow.addColorStop(0.5, 'rgba(0,0,0,0.10)');
      shadow.addColorStop(1, 'transparent');
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - span * 1.2, floor - 8, span * 2.4, 16);

      // the frame: legs + a rounded bar with a soft gradient
      ctx.lineCap = 'round';
      ctx.strokeStyle = css('--color-text-muted');
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - span * 0.86, barY + 4);
      ctx.lineTo(cx - span * 1.02, floor);
      ctx.moveTo(cx + span * 0.86, barY + 4);
      ctx.lineTo(cx + span * 1.02, floor);
      ctx.stroke();

      const bar = ctx.createLinearGradient(0, barY - 7, 0, barY + 7);
      bar.addColorStop(0, css('--color-text'));
      bar.addColorStop(1, css('--color-text-muted'));
      ctx.strokeStyle = bar;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(cx - span, barY);
      ctx.lineTo(cx + span, barY);
      ctx.stroke();

      // strings + balls
      for (let i = 0; i < this.n; i++) {
        const b = this.ballPos(i, w, h);
        const anchorX = cx + (i - (this.n - 1) / 2) * 2.02 * r;
        ctx.strokeStyle = css('--color-text-muted');
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(anchorX, barY);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const c = this.colors[i % this.colors.length] || '#1d4ed8';
        // soft shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(b.x + r * 0.18, b.y + r * 0.28, r, r * 0.96, 0, 0, Math.PI * 2);
        ctx.fill();
        // the ball: shaded sphere
        const grad = ctx.createRadialGradient(b.x - r * 0.4, b.y - r * 0.45, r * 0.15, b.x, b.y, r * 1.05);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.16, c);
        grad.addColorStop(1, shade(c, 0.72));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        // specular highlight
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(b.x - r * 0.34, b.y - r * 0.4, r * 0.2, r * 0.13, -0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // legend under the cradle
      ctx.font = `500 ${Math.max(10, r * 0.42)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const legendY = floor + 14;
      const cols = this.n;
      for (let i = 0; i < cols; i++) {
        const x = cx + (i - (cols - 1) / 2) * (span * 2 / cols);
        ctx.fillStyle = this.colors[i % this.colors.length];
        ctx.beginPath();
        ctx.arc(x, legendY + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = css('--color-text');
        ctx.fillText(this.labels[i] || '', x, legendY + 16);
      }
    }
  }

  /* ========================================================= ERLENMEYERS */
  class Flasks {
    constructor(canvas) {
      this.canvas = canvas;
      const labels = (canvas.dataset.labels || '').split('|');
      const colors = (canvas.dataset.colors || '').split('|');
      this.f = labels.map((label, i) => ({
        label,
        color: colors[i % colors.length],
        ml: 100,
        x: 0.12 + i * 0.19,
        y: 0.42,
        tilt: 0,
        pour: null,
      }));
      this.drag = null;
      canvas.addEventListener('pointerdown', (e) => this.down(e));
      canvas.addEventListener('pointermove', (e) => this.move(e));
      canvas.addEventListener('pointerup', (e) => this.up(e));
      canvas.addEventListener('pointercancel', (e) => this.up(e));
    }

    hit(p, w, h) {
      for (let i = this.f.length - 1; i >= 0; i--) {
        const f = this.f[i];
        const x = f.x * w;
        const y = f.y * h;
        if (Math.abs(p.x - x) < w * 0.075 && Math.abs(p.y - y) < h * 0.3) return i;
      }
      return -1;
    }

    down(e) {
      const { w, h } = fit(this.canvas);
      const p = pointer(this.canvas, e);
      const i = this.hit(p, w, h);
      if (i < 0) return;
      this.drag = i;
      this.f[i].tilt = 0;
      this.canvas.setPointerCapture(e.pointerId);
    }

    move(e) {
      if (this.drag === null) return;
      const { w, h } = fit(this.canvas);
      const p = pointer(this.canvas, e);
      const f = this.f[this.drag];
      f.x = p.x / w;
      f.y = p.y / h;
      // pouring: hovering over another flask tips this one towards it
      f.pour = null;
      for (let j = 0; j < this.f.length; j++) {
        if (j === this.drag) continue;
        const g = this.f[j];
        const d = Math.hypot((g.x - f.x) * w, (g.y - f.y) * h);
        if (d < w * 0.14) {
          f.pour = j;
          f.tilt = g.x > f.x ? 1 : -1;
          break;
        }
      }
      if (!f.pour) f.tilt *= 0.8;
    }

    up() {
      if (this.drag !== null && this.f[this.drag].pour !== null) {
        const f = this.f[this.drag];
        const g = this.f[f.pour];
        // pour: half of the donor, colours mix by volume
        const give = f.ml / 2;
        const total = g.ml + give;
        const mix = (a, b, t) => Math.round(a * t + b * (1 - t));
        const [fr, fg, fb] = f.color;
        const [gr, gg, gb] = g.color;
        g.color = [
          mix(fr, gr, give / total),
          mix(fg, gg, give / total),
          mix(fb, gb, give / total),
        ];
        g.ml = total;
        f.ml -= give;
      }
      if (this.drag !== null) this.f[this.drag].tilt = 0;
      this.drag = null;
    }

    colorCss(c) {
      return Array.isArray(c) ? `rgb(${c[0]},${c[1]},${c[2]})` : c;
    }

    draw() {
      const { ctx, w, h } = fit(this.canvas);
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w * 0.075, h * 0.2);
      const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

      for (const f of this.f) {
        const x = f.x * w;
        const y = f.y * h;
        const body = new Path2D();
        body.moveTo(-s * 0.26, -s * 1.1);
        body.lineTo(-s * 0.26, -s * 0.32);
        body.lineTo(-s * 0.92, s * 0.72);
        body.quadraticCurveTo(-s * 0.98, s * 1.02, -s * 0.58, s * 1.02);
        body.lineTo(s * 0.58, s * 1.02);
        body.quadraticCurveTo(s * 0.98, s * 1.02, s * 0.92, s * 0.72);
        body.lineTo(s * 0.26, -s * 0.32);
        body.lineTo(s * 0.26, -s * 1.1);

        ctx.save();
        ctx.translate(x, y + 10);
        ctx.scale(1, 0.28);
        ctx.fillStyle = 'rgba(0,0,0,0.13)';
        ctx.beginPath();
        ctx.ellipse(0, s * 3.6, s * 1.15, s * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(f.tilt * 0.5);

        // glass
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fill(body);
        ctx.lineWidth = 3;
        ctx.strokeStyle = css('--color-text-muted');
        ctx.stroke(body);

        // the liquid
        const level = Math.max(0, Math.min(1, f.ml / 165));
        if (level > 0.01) {
          ctx.save();
          ctx.clip(body);
          const top = s * (0.95 - 2 * level);
          const liquid = ctx.createLinearGradient(0, top, 0, s * 1.02);
          liquid.addColorStop(0, this.colorCss(f.color));
          liquid.addColorStop(1, shade(this.colorCss(f.color), 0.78));
          ctx.fillStyle = liquid;
          ctx.fillRect(-s * 1.3, top, s * 2.6, s * 2.2);
          // the surface
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
          ctx.beginPath();
          ctx.ellipse(0, top, s * 1.28, s * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // glass highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, -s * 0.95);
        ctx.lineTo(-s * 0.12, -s * 0.4);
        ctx.lineTo(-s * 0.52, s * 0.55);
        ctx.stroke();

        // the label
        ctx.rotate(-f.tilt * 0.5);
        ctx.fillStyle = css('--color-text');
        ctx.font = `700 ${Math.max(10, s * 0.34)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(f.label, 0, s * 1.2);
        ctx.restore();
      }
    }
  }

  /* ============================================== palette from the tokens */
  function palette() {
    return [
      'var(--palette-blue)', 'var(--palette-pink)', 'var(--palette-yellow)',
      'var(--palette-green)', 'var(--palette-orange)',
    ].map((v) => {
      const probe = document.createElement('span');
      probe.style.color = v;
      document.body.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      const m = rgb.match(/\d+/g);
      return m ? [ +m[0], +m[1], +m[2] ] : [29, 78, 216];
    });
  }

  /* ================================================================ boot */
  function boot() {
    const colors = palette();
    document.querySelectorAll('[data-cradle]').forEach((c) => {
      c.dataset.colors = colors.map((c2) => `rgb(${c2[0]},${c2[1]},${c2[2]})`).join('|');
      widgets.push(new Cradle(c));
    });
    document.querySelectorAll('[data-flasks]').forEach((c) => {
      c.dataset.colors = colors.map((c2) => c2.join(',')).join('|');
      const f = new Flasks(c);
      f.f.forEach((fl, i) => (fl.color = colors[i % colors.length]));
      widgets.push(f);
    });

    // one loop for everything; parked when nothing is on screen
    const onScreen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
    });
    widgets.forEach((wg) => io.observe(wg.canvas));

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (onScreen.size > 0) {
        for (const wg of widgets) {
          if (wg.step) wg.step(dt);
          wg.draw();
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
