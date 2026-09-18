import React from 'react';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  caption?: string;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, loading = false, empty, caption }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-line bg-surface p-3">
        <Skeleton rows={5} />
      </div>
    );
  }

  if (rows.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-2.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-faint ${
                  column.className ?? ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter') onRowClick(row);
                    }
                  : undefined
              }
              className={`border-b border-line-soft last:border-b-0 ${
                onRowClick
                  ? 'cursor-pointer transition-colors duration-150 ease-out hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
                  : ''
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-[13px] text-muted ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
