import { useId, useRef } from 'react';
import { periodicData } from '../../chemistry/electron-configuration/periodic-data.ts';
function PeriodicIcon() {
  const cells = [];
  for (let row = 0; row < 7; row++)
    for (let col = 0; col < 18; col++) {
      if (row === 0 ? col === 0 || col === 17 : row < 3 ? col < 2 || col > 11 : true)
        cells.push(
          <rect
            key={`${row}:${col}`}
            x={col * 3.2 + 1}
            y={row * 3.8 + 1}
            width="2.3"
            height="2.8"
            rx=".4"
          />,
        );
    }
  for (let row = 0; row < 2; row++)
    for (let col = 2; col < 17; col++)
      cells.push(
        <rect
          key={`series:${row}:${col}`}
          x={col * 3.2 + 1}
          y={row * 3.8 + 29}
          width="2.3"
          height="2.8"
          rx=".4"
        />,
      );
  return (
    <svg
      className="ec-periodic-icon"
      viewBox="0 0 59 37"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      {cells}
    </svg>
  );
}
/** Original built-in reference remains available in student and teacher mode; no response/assistance command. */
export function PeriodicReference() {
  const dialog = useRef<HTMLDialogElement>(null),
    id = useId();
  const oldGroups = { 1: 1, 2: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 7, 18: 0 };
  return (
    <div className="ec-reference">
      <button
        className="ec-periodic-trigger"
        aria-label="Periodic table"
        title="Open periodic table"
        type="button"
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => dialog.current?.showModal()}
      >
        <PeriodicIcon />
        <span className="ec-periodic-trigger-label">Periodic table</span>
      </button>
      <dialog ref={dialog} id={id} className="ec-periodic-dialog" aria-labelledby={`${id}-title`}>
        <header className="ec-periodic-heading">
          <div>
            <p>CHEMISTRY REFERENCE</p>
            <h2 id={`${id}-title`}>Periodic table of the elements</h2>
          </div>
          <button
            className="ec-periodic-close"
            type="button"
            autoFocus
            aria-label="Close periodic table"
            onClick={() => dialog.current?.close()}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="m6 6 12 12M6 18 18 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="ec-periodic-paper">
          <div
            className="ec-periodic-scroll"
            tabIndex={0}
            role="region"
            aria-label="Periodic table; scroll horizontally to see all groups"
          >
            <div className="ec-periodic-grid">
              {Object.entries(oldGroups).map(([column, group]) => (
                <span
                  className="ec-periodic-old-group"
                  key={column}
                  style={{ gridColumn: Number(column), gridRow: 1 }}
                  aria-label={`Traditional group ${group}`}
                >
                  ({group})
                </span>
              ))}
              <div
                className="ec-periodic-key"
                style={{ gridColumn: '4 / span 4', gridRow: '2 / span 2' }}
              >
                <strong>Key</strong>
                <span>atomic number</span>
                <b>Symbol</b>
                <small>name</small>
                <span>relative atomic mass</span>
              </div>
              {periodicData.elements.map((element) => {
                const first =
                  element.z === 1 ||
                  element.z === 2 ||
                  element.z === 4 ||
                  (element.z >= 5 && element.z <= 9) ||
                  (element.z >= 21 && element.z <= 30);
                return (
                  <div
                    key={element.z}
                    className="ec-periodic-element"
                    data-atomic-number={element.z}
                    style={{ gridColumn: element.column, gridRow: element.row + 1 }}
                    role="img"
                    aria-label={`${element.name}, ${element.symbol}, atomic number ${element.z}${element.mass ? ', relative atomic mass ' + element.mass : ', relative atomic mass not supplied'}`}
                  >
                    {first && (
                      <span className="ec-periodic-group" aria-label={`Group ${element.column}`}>
                        {element.column}
                      </span>
                    )}
                    <span className="ec-periodic-number">{element.z}</span>
                    <strong className="ec-periodic-symbol">{element.symbol}</strong>
                    <span className="ec-periodic-name">{element.name}</span>
                    <span className="ec-periodic-mass">{element.mass ?? ''}</span>
                  </div>
                );
              })}
              {(
                [
                  { row: 7, range: '57–71', name: 'lanthanoids' },
                  { row: 8, range: '89–103', name: 'actinoids' },
                ] as const
              ).map((series) => (
                <div
                  className="ec-periodic-series"
                  key={series.row}
                  style={{ gridColumn: 3, gridRow: series.row }}
                >
                  <span>{series.range}</span>
                  <small>{series.name}</small>
                </div>
              ))}
              {[13, 15, 17, 18].map((column) => (
                <div
                  key={column}
                  className="ec-periodic-blank"
                  style={{ gridColumn: column, gridRow: 8 }}
                  aria-hidden="true"
                />
              ))}
              <span
                className="ec-periodic-series-label"
                style={{ gridColumn: '1 / span 2', gridRow: 10 }}
              >
                Lanthanoids
              </span>
              <span
                className="ec-periodic-series-label"
                style={{ gridColumn: '1 / span 2', gridRow: 11 }}
              >
                Actinoids
              </span>
            </div>
          </div>
        </div>
        <footer className="ec-periodic-footer">
          <span>OCR Chemistry A · 2020 data sheet</span>
          <span>
            Values and blank entries follow the supplied edition. Scroll across on smaller screens.
          </span>
        </footer>
      </dialog>
    </div>
  );
}
