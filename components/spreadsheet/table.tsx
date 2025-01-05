'use client';

import { Cell } from './cells/cell';
import { HeaderRow } from './grid/header-row';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';

export function Table() {
  const { activeCell } = useSpreadsheetContext();
  const columns = 26;
  const rows = 100;

  const getCellId = (col: number, row: number) => {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  };

  return (
    <div className="overflow-auto h-full">
      <table className="border-collapse w-full">
        <thead>
          <HeaderRow columns={columns} />
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              <td className="border bg-muted text-center">{row + 1}</td>
              {Array.from({ length: columns }).map((_, col) => {
                const cellId = getCellId(col, row);
                return (
                  <Cell
                    key={cellId}
                    cellId={cellId}
                    isActive={cellId === activeCell}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}