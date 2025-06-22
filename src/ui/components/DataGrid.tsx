import React from 'react';
import { tokens } from 'mirotone-react';

export interface PreviewRow {
  node: string;
  edge: string;
  status: string;
  valid: boolean;
}

/**
 * Simple DataGrid implementation using a table element.
 * Rows with `valid=false` are highlighted in red.
 */
export function DataGrid({ rows }: { rows: PreviewRow[] }): React.JSX.Element {
  return (
    <table role='table' className='data-grid'>
      <thead>
        <tr>
          <th>Node</th>
          <th>Edge</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={i}
            style={!r.valid ? { background: tokens.color.red[600] } : {}}
          >
            <td>{r.node}</td>
            <td>{r.edge}</td>
            <td
              title={
                !r.valid
                  ? `Edge refers to missing node ‘${r.status.replace('Missing node ', '')}’.`
                  : undefined
              }
            >
              {r.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
