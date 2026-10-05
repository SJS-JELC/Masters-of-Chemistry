import type { ContentBlock } from '../contracts/question.ts';
import { DiagramViewport } from './DiagramViewport.tsx';

function needsViewport(src: string): boolean {
  if (!src.startsWith('data:image/svg+xml')) return true;
  try {
    const match = decodeURIComponent(src.slice(src.indexOf(',') + 1)).match(
      /viewBox=["']([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)["']/,
    );
    return !match || Number(match[3]) > 350 || Number(match[4]) > 260;
  } catch {
    return true;
  }
}

export function Content({ blocks }: { readonly blocks: readonly ContentBlock[] }) {
  return (
    <div className="content">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'text':
            return <p key={index}>{block.text}</p>;
          case 'formula':
            return (
              <p className="formula" key={index}>
                {block.text}
              </p>
            );
          case 'image':
            return needsViewport(block.src) ? (
              <DiagramViewport key={index} label={block.alt}>
                <img className="content-image" src={block.src} alt={block.alt} />
              </DiagramViewport>
            ) : (
              <img key={index} className="content-image" src={block.src} alt={block.alt} />
            );
          case 'table':
            return (
              <div className="table-scroll" key={index}>
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((header, column) => (
                        <th key={column} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, column) => (
                          <td key={column}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
