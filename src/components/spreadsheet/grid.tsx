'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';

export function Grid() {
  const { activeCell, setActiveCell, data } = useSpreadsheetContext();

  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  const renderCell = (cellId: string) => {
    const cellData = data[cellId];
    const displayValue = cellData?.value ? evaluateFormula(cellData.value, data) : '';
    
    return (
      <div
        key={cellId}
        className={`border border-gray-200 p-1 min-w-[100px] h-[25px] ${
          activeCell === cellId ? 'bg-blue-50' : ''
        }`}
        onClick={() => setActiveCell(cellId)}
      >
        {displayValue}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Header row with column letters */}
      <div className="flex sticky top-0 bg-gray-50 z-10">
        <div className="w-[50px] border-r border-b" /> {/* Corner cell */}
        {columns.map((col) => (
          <div key={col} className="min-w-[100px] border-r border-b p-1 text-center font-medium">
            {col}
          </div>
        ))}
      </div>

      {/* Grid with row numbers and cells */}
      <div className="flex">
        {/* Row numbers column */}
        <div className="sticky left-0 bg-gray-90 w-[50px]">
          {rows.map((row) => (
            <div key={row} className="border-r border-b h-[25px] flex items-center justify-center text-sm">
              {row}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div>
          {rows.map((row) => (
            <div key={row} className="flex">
              {columns.map((col) => renderCell(`${col}${row}`))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 