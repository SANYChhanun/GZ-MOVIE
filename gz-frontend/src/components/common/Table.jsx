// src/components/common/Table.jsx
export default function Table({ headers, rows, empty }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/70">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-medium text-slate-400 uppercase tracking-wider text-xs px-4 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500 text-sm">
                {empty || "Nothing to show."}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 whitespace-nowrap text-slate-200">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
