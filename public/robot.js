/**
 * robot.js — tiny scroll progress publisher for the line-follower robot.
 *
 * DOCUMENTED PROGRESSIVE ENHANCEMENT (see AGENTS.md): the site is complete
 * without this file. CSS scroll-driven animations do the same job where the
 * browser supports them, but not everywhere (and the robot should keep you
 * company regardless). This publishes the scroll position as the `--scroll`
 * custom property (0..1) on <html>, rAF-throttled. No dependencies, no
 * cookies, no network. ~15 lines.
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
})();
