export interface CellData {
  value: string;
  formula?: string;
  style?: CellStyle;
  metadata?: Record<string, any>;
}

export interface CellStyle {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SheetData {
  [cellId: string]: CellData;
}

export interface SpreadsheetData {
  [sheetId: string]: SheetData;
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

export interface Selection {
  start: string;
  end: string;
}

export interface SheetMetadata {
  id: number;
  name: string;
  userId: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}