import { useSpreadsheet } from '@/context/spreadsheet-context';

export function FormulaBar() {
  const { activeCell, activeSheet } = useSpreadsheet();
  // ... rest of the component ...
} 