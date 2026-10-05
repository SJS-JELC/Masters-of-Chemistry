import { useState } from 'react';
import type { ReactNode } from 'react';
/** Whole orientation plus readable detail, preserving keyboard and touch scrolling. */
export function DiagramViewport({
  children,
  label,
}: {
  readonly children: ReactNode;
  readonly label: string;
}) {
  const [detail, setDetail] = useState(false);
  return (
    <div className={`diagram-viewport ${detail ? 'diagram-detail' : 'diagram-fit'}`}>
      <div className="diagram-view-controls" role="group" aria-label={`${label} view`}>
        <button type="button" aria-pressed={!detail} onClick={() => setDetail(false)}>
          Fit whole diagram
        </button>
        <button type="button" aria-pressed={detail} onClick={() => setDetail(true)}>
          Zoom for detail
        </button>
      </div>
      <p className="support-note">
        {detail
          ? 'Detail view: swipe or scroll inside the diagram. Keyboard: focus the diagram and use arrow keys.'
          : 'Whole diagram shown. Choose Zoom for detail to inspect labels and use larger controls.'}
      </p>
      <div
        className="diagram-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${label}; ${detail ? 'scroll for detail' : 'whole diagram'}`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget || !detail) return;
          const offset = (
            {
              ArrowLeft: [-80, 0],
              ArrowRight: [80, 0],
              ArrowUp: [0, -80],
              ArrowDown: [0, 80],
            } as const
          )[event.key as 'ArrowLeft'];
          if (offset) {
            event.preventDefault();
            event.currentTarget.scrollLeft += offset[0];
            event.currentTarget.scrollTop += offset[1];
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
