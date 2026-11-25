// Page sections reveal independently, while the complete footer reveals as one
// unit so its benefits, content, and utility bar always appear together.
const sectionSelector = '#MainContent > .shopify-section, footer';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const section = entry.target;
        section.classList.remove('section-reveal--pending');
        section.classList.add('section-reveal--visible');
        section.dataset.sectionRevealComplete = 'true';
        revealObserver.unobserve(section);
      }
    },
    {
      // Reveal as soon as a section enters the viewport. A negative bottom
      // margin can leave short final sections permanently hidden because the
      // document cannot scroll them past an inset trigger line.
      rootMargin: '0px',
      threshold: 0.01,
    }
  );

  /** @param {ParentNode} root */
  const prepareSections = (root = document) => {
    const sections = [];

    if (root instanceof Element && root.matches(sectionSelector)) sections.push(root);
    sections.push(...root.querySelectorAll(sectionSelector));

    for (const section of sections) {
      if (section.dataset.sectionRevealComplete === 'true' || section.classList.contains('section-reveal--pending')) {
        continue;
      }

      section.dataset.sectionReveal = '';
      section.classList.add('section-reveal--pending');

      // Allow the pending state to paint before observing. This guarantees that
      // entering sections transition from the hidden state as the user scrolls.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (section.isConnected && !reducedMotion.matches) revealObserver.observe(section);
        });
      });
    }
  };

  prepareSections();

  const mutationObserver = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element) prepareSections(node);
      }
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) return;

    revealObserver.disconnect();
    mutationObserver.disconnect();

    for (const section of document.querySelectorAll('[data-section-reveal]')) {
      section.classList.remove('section-reveal--pending');
      section.classList.add('section-reveal--visible');
    }
  });
}
