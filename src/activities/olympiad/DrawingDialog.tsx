import { createContext, useContext, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './drawing-dialog.css';

/** The host owns persistence; the dialog shows the same recoverable save failure. */
export const OlympiadSaveNotice = createContext<ReactNode>(null);

export function DrawingDialog({ title, onClose, children }: {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const saveNotice = useContext(OlympiadSaveNotice);
  useEffect(() => {
    const node = dialog.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    node.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      node.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} className="olympiad-drawing-dialog" aria-labelledby={titleId}
    onKeyDown={event => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const fields = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
        'button,input,select,textarea,a[href],summary,[tabindex]',
      )).filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && node.checkVisibility());
      const first = fields[0], last = fields.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="drawing-dialog-header">
      <h2 id={titleId}>{title}</h2>
      <button type="button" autoFocus onClick={onClose}>Done</button>
    </header>
    <div className="drawing-dialog-content">
      {saveNotice}
      {children}
    </div>
  </dialog>;
}
