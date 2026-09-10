"use strict";

// 全ページ共通の初期処理。deferでHTML解析後に実行します。
(() => {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();

// 共通ヘッダーと、data-revealを付けた要素のスクロール演出。
(() => {
  const header = document.querySelector('.top-header, .site-header');
  if (header) {
    const syncHeight = () => document.documentElement.style.setProperty(
      '--sticky-header-height', `${header.getBoundingClientRect().height}px`
    );
    syncHeight();
    if ('ResizeObserver' in window) new ResizeObserver(syncHeight).observe(header);
    else window.addEventListener('resize', syncHeight);
    const syncScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const animations = new Set();
  const observer = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (reducedMotion.matches) return;
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], {
        duration: 650,
        delay: Math.min(order++ * 80, 240),
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    });
  }, { threshold: 0.08 });
  const observeReveals = () => document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
  if (document.body.classList.contains('is-loading')) {
    document.addEventListener('elevate:opening-complete', observeReveals, { once: true });
  } else {
    observeReveals();
  }
  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) return;
    observer.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  });
})();
