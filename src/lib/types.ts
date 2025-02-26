export interface CellData {
  value: any;
  formula: string;
  style: CellStyle;
  isModified: boolean;
  lastModified: string;
  metadata?: Record<string, any>;
}

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface SheetData {
  id: number;
  name: string;
  workbookId: string | null;
  cells: Record<string, CellData>;
}

export interface WorkbookData {
  id: string;
  activeSheetId: number;
  sheets: SheetData[];
}

export type Selection = {
  start: string;
  end: string;
} | null;

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

export interface SheetMetadata {
  id: number;
  name: string;
  userId: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}