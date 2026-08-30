import React from 'react';
import { Spinner } from './Spinner.jsx';
import { EmptyState } from './EmptyState.jsx';

export function Table({ columns = [], data = [], loading = false, emptyText = 'No data available' }) {
  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyText} />;
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-800 rounded-3xl bg-slate-900/80 shadow-xl">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-950/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.header} className="px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="hover:bg-slate-800/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key || col.header} className="px-6 py-4 font-semibold">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
