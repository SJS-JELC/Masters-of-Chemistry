import type { ReactNode } from 'react';
import type { EditorState } from '../contracts/editors.ts';
import type { EditorPart, Response } from '../contracts/question.ts';

export interface EditorSurfaceProps {
  readonly part: EditorPart;
  readonly response: Response | undefined;
  readonly readOnly: boolean;
  readonly onResponse: (response: EditorState) => void;
  /** Optional shared-player marking pane for the source dot workspace. */
  readonly workspaceAside?: ReactNode;
}

/** The activity owns gestures and chemical validation; the frame owns shared presentation. */
export function EditorFrame({
  title,
  readOnly,
  instructions,
  tools,
  alternatives,
  children,
}: {
  readonly title: string;
  readonly readOnly: boolean;
  readonly instructions?: ReactNode;
  readonly tools?: ReactNode;
  readonly alternatives?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="editor-frame" aria-label={title}>
      <header className="editor-header">
        <strong>{title}</strong>
        {readOnly && <span className="badge">Read only</span>}
      </header>
      {instructions && <div className="editor-instructions">{instructions}</div>}
      {tools && (
        <div className="editor-tools" role="group" aria-label={`${title} tools`}>
          {tools}
        </div>
      )}
      <div className="editor-surface">{children}</div>
      {alternatives && (
        <details className="editor-alternatives">
          <summary>Keyboard and non-drag controls</summary>
          {alternatives}
        </details>
      )}
    </section>
  );
}
