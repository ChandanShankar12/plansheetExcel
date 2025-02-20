import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheets';

export interface CellData {
  id: string;
  value: string | null;
  formula: string;
  style: CellStyle;
  lastModified: string;
  isModified: boolean;
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

export type SheetData = Record<string, Cell>;

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