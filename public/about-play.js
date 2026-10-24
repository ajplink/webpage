/**
 * about-play.js — the Newton's cradle on the About page.
 *
 * DOCUMENTED PROGRESSIVE ENHANCEMENT (see AGENTS.md): the page is complete
 * without this file; it only adds the experiment. Vanilla canvas 2D, no
 * dependencies, one requestAnimationFrame loop, parked off-screen.
 *
 * Physics: n pendulums (gravity + small damping) with IMPACTS modelled
 * properly — on contact the HORIZONTAL velocity components of the equal
 * masses are swapped (elastic collision), and the balls are separated so
 * they cannot stick. Drag a ball and let go.
 */
(() => {
  'use strict';

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const G = 1400;

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

  const shade = (c, k) => {
    const m = String(c).match(/\d+/g);
    return m ? `rgb(${Math.round(m[0] * k)},${Math.round(m[1] * k)},${Math.round(m[2] * k)})` : c;
  };

  function palette() {
    return ['--palette-blue', '--palette-pink', '--palette-yellow', '--palette-green', '--palette-orange']
      .map((v) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${v})`;
        document.body.appendChild(probe);
        const m = getComputedStyle(probe).color.match(/\d+/g);
        probe.remove();
        return m ? [ +m[0], +m[1], +m[2] ] : [29, 78, 216];
      });
  }

  class Cradle {
    constructor(canvas, colors) {
      this.canvas = canvas;
      this.colors = colors;
      this.labels = (canvas.dataset.labels || '').split('|');
      this.n = this.labels.length;
      this.theta = new Float64Array(this.n);
      this.omega = new Float64Array(this.n);
      this.drag = -1;
      this.theta[0] = -1.05; // the classic opening move
      for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
        canvas.addEventListener(ev, (e) => this[ev.replace('pointer', '').replace('cancel', 'up')](e));
      }
    }

    geom(w, h) {
      const r = Math.min(w / (this.n * 2.7), h / 5.2);
      const len = Math.min(h * 0.5, w * 0.46);
      return { r, len, cx: w / 2, cy: h * 0.14 };
    }

    anchor(i, w, h) {
      const { r, cx, cy } = this.geom(w, h);
      return { x: cx + (i - (this.n - 1) / 2) * 2.04 * r, y: cy };
    }

    ball(i, w, h) {
      const { r, len } = this.geom(w, h);
      const a = this.anchor(i, w, h);
      return { x: a.x + len * Math.sin(this.theta[i]), y: a.y + len * Math.cos(this.theta[i]), r };
    }

    // horizontal velocity of ball i
    v(i, len) {
      return len * Math.cos(this.theta[i]) * this.omega[i];
    }

    setV(i, value, len) {
      const c = Math.cos(this.theta[i]);
      this.omega[i] = Math.abs(c) < 0.15 ? 0 : value / (len * c);
    }

    down(e) {
      const { w, h } = fit(this.canvas);
      const p = { x: e.clientX - this.canvas.getBoundingClientRect().left, y: e.clientY - this.canvas.getBoundingClientRect().top };
      for (let i = 0; i < this.n; i++) {
        const b = this.ball(i, w, h);
        if (Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.7) {
          this.drag = i;
          this.omega[i] = 0;
          this.canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    }

    move(e) {
      if (this.drag < 0) return;
      const { w, h } = fit(this.canvas);
      const { cx, cy } = this.geom(w, h);
      const a = this.anchor(this.drag, w, h);
      const r = this.canvas.getBoundingClientRect();
      const p = { x: e.clientX - r.left, y: e.clientY - r.top };
      const next = Math.max(-1.35, Math.min(1.35, Math.atan2(p.x - a.x, Math.max(1, p.y - cy))));
      this.omega[this.drag] = (next - this.theta[this.drag]) * 14;
      this.theta[this.drag] = next;
      void cx;
    }

    up() {
      this.drag = -1;
    }

    step(dt) {
      const { w, h } = fit(this.canvas);
      const { r, len } = this.geom(w, h);
      const sub = 6;
      for (let s = 0; s < sub; s++) {
        const t = dt / sub;
        for (let i = 0; i < this.n; i++) {
          if (i === this.drag) continue;
          this.omega[i] += (-(G / len) * Math.sin(this.theta[i])) * t;
          this.omega[i] *= 0.9995;
          this.theta[i] += this.omega[i] * t;
        }
        // impacts: equal masses swap their horizontal velocities
        for (let pass = 0; pass < 4; pass++) {
          for (let i = 0; i < this.n - 1; i++) {
            const a = this.ball(i, w, h);
            const b = this.ball(i + 1, w, h);
            const overlap = 2 * r + 0.4 - Math.abs(b.x - a.x);
            if (overlap <= 0) continue;
            const va = this.v(i, len);
            const vb = this.v(i + 1, len);
            if (va > vb) {
              if (i !== this.drag) this.setV(i, vb, len);
              if (i + 1 !== this.drag) this.setV(i + 1, va, len);
            }
            // push apart so they never stick
            const push = overlap / 2 / len;
            if (i !== this.drag) this.theta[i] -= push;
            if (i + 1 !== this.drag) this.theta[i + 1] += push;
          }
        }
      }
    }

    draw() {
      const { ctx, w, h } = fit(this.canvas);
      const { r, len, cx, cy } = this.geom(w, h);
      const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      ctx.clearRect(0, 0, w, h);
      const barY = cy - 4;
      const span = w * 0.34;
      const floor = cy + len + r * 1.5;

      // the floor
      const shadow = ctx.createLinearGradient(0, floor - 10, 0, floor + 10);
      shadow.addColorStop(0, 'transparent');
      shadow.addColorStop(0.5, 'rgba(0,0,0,0.12)');
      shadow.addColorStop(1, 'transparent');
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - span * 1.25, floor - 10, span * 2.5, 20);

      // the frame
      ctx.lineCap = 'round';
      ctx.strokeStyle = css('--color-text-muted');
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - span * 0.88, barY + 6);
      ctx.lineTo(cx - span * 1.05, floor);
      ctx.moveTo(cx + span * 0.88, barY + 6);
      ctx.lineTo(cx + span * 1.05, floor);
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
        const b = this.ball(i, w, h);
        const a = this.anchor(i, w, h);
        ctx.strokeStyle = css('--color-text-muted');
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(a.x, barY);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        const c = this.colors[i % this.colors.length];
        const rgb = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillStyle = 'rgba(0,0,0,0.13)';
        ctx.beginPath();
        ctx.ellipse(b.x + r * 0.16, b.y + r * 0.3, r, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        const grad = ctx.createRadialGradient(b.x - r * 0.4, b.y - r * 0.45, r * 0.12, b.x, b.y, r * 1.05);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.18, rgb);
        grad.addColorStop(1, shade(rgb, 0.7));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.ellipse(b.x - r * 0.32, b.y - r * 0.42, r * 0.2, r * 0.12, -0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // legend
      const legendY = floor + 18;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i < this.n; i++) {
        const x = cx + (i - (this.n - 1) / 2) * (span * 2.05 / this.n);
        ctx.fillStyle = `rgb(${this.colors[i % this.colors.length].join(',')})`;
        ctx.beginPath();
        ctx.arc(x, legendY + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = css('--color-text');
        ctx.font = `500 ${Math.max(10, r * 0.4)}px system-ui, sans-serif`;
        ctx.fillText(this.labels[i] || '', x, legendY + 16);
      }
    }
  }

  /* ================================================================ boot */
  function boot() {
    const colors = palette();
    const widgets = [];
    document.querySelectorAll('[data-cradle]').forEach((c) => widgets.push(new Cradle(c, colors)));

    const onScreen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
    });
    widgets.forEach((wg) => io.observe(wg.canvas));

    let last = performance.now();
    (function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (onScreen.size > 0) {
        for (const wg of widgets) {
          wg.step(dt);
          wg.draw();
        }
      }
      requestAnimationFrame(frame);
    })(performance.now());
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
