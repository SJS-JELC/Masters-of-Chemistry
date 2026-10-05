/** Original A Level app.js layout animation, with React committing the class changes. */
export function captureTopicLayout(sections: HTMLElement[]) {
  return sections.map((section) => {
    section.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
    const row = section.querySelector<HTMLElement>('.topic-gems')!;
    const bounds = row.getBoundingClientRect();
    return {
      section,
      row,
      height: bounds.height,
      icons: Array.from(row.querySelectorAll('svg')).map((icon) => {
        const rect = icon.getBoundingClientRect();
        return { icon, x: rect.left - bounds.left, y: rect.top - bounds.top };
      }),
    };
  });
}
export function animateTopicLayout(before: ReturnType<typeof captureTopicLayout>) {
  for (const state of before) {
    const bounds = state.row.getBoundingClientRect();
    const timing = { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' };
    for (const { icon, x, y } of state.icons) {
      const rect = icon.getBoundingClientRect();
      icon.animate(
        [
          {
            transform: `translate(${x - (rect.left - bounds.left)}px, ${y - (rect.top - bounds.top)}px)`,
          },
          { transform: 'translate(0, 0)' },
        ],
        timing,
      );
    }
    state.row.animate([{ height: state.height + 'px' }, { height: bounds.height + 'px' }], timing);
    if (state.section.classList.contains('expanded'))
      state.row
        .querySelectorAll('.gem-name')
        .forEach((name) =>
          name.animate([{ opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 1 }], timing),
        );
  }
}
