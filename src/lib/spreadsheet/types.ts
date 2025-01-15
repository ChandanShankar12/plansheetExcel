export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
}

export interface CellData {
  value: string;
  formula?: string;
  style?: CellStyle;
}

export interface SpreadsheetData {
  [key: string]: CellData;
}

export interface SpreadsheetContextType {
  activeCell: string | null;
  data: SpreadsheetData;
  updateCell: (cell: string, data: Partial<CellData>) => void;
  setActiveCell: (cell: string | null) => void;
}
export interface SpreadsheetHistory {
  past: Record<string, CellData>[];
  future: Record<string, CellData>[];
}