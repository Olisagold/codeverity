import React from 'react';
import { InlineText } from './InlineText';

interface ParamTableProps {
  columns: string[];
  rows: string[][];
}

export function ParamTable({ columns, rows }: ParamTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')} className="border-b border-line-soft last:border-b-0">
              {row.map((cell, index) => (
                <td key={index} className={`px-4 py-3 align-top text-[13px] ${index === 0 ? 'font-mono text-[12.5px] text-white' : 'text-muted'}`}>
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
