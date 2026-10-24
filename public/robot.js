/**
 * robot.js — the site's scroll behaviours.
 *
 * DOCUMENTED PROGRESSIVE ENHANCEMENT (see AGENTS.md): the site is complete
 * without this file. Two jobs, both tiny, both optional:
 *
 *   1. publishes the scroll position as `--scroll` (0..1) on <html>, so
 *      scroll-linked art (the line-follower robot) works in browsers
 *      without CSS scroll timelines;
 *   2. reveals blocks as they enter the viewport (the `data-reveal` +
 *      `is-visible` dance in global.css) — the things show up as you go.
 *
 * No dependencies, no cookies, no network. Under prefers-reduced-motion
 * nothing is hidden and nothing moves.
 */
(() => {
  const root = document.documentElement;
  let ticking = false;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  function publish() {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--scroll', max > 0 ? String(scrollY / max) : '0');
  }

  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(publish);
      }
    },
    { passive: true },
  );
  publish();

  /* 2. blocks show up as you scroll down (after the DOM exists) */
  const reveal = () => {
  const targets = document.querySelectorAll(
    'main .page-head, main section, main .panel, .card, .value, figure, .join-form, .sponsors-now, .quiet-join',
  );
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px' },
  );
  for (const el of targets) {
    el.setAttribute('data-reveal', '');
    io.observe(el);
  }
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', reveal)
    : reveal();
})();
