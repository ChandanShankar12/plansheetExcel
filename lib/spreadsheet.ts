import { CellData } from './spreadsheet/types';

export function evaluateFormula(formula: string, data: Record<string, CellData>): string {
  if (!formula.startsWith('=')) return formula;

  try {
    const expression = formula.substring(1);
    const evaluatedExpression = expression.replace(/[A-Z]\d+/g, (match) => {
      const cellData = data[match] || { value: '0', style: {} };
      const value = cellData.value;
      return value.startsWith('=') ? evaluateFormula(value, data) : value;
    });

    if (!/^[\d\s+\-*/().]+$/.test(evaluatedExpression)) {
      throw new Error('Invalid formula');
    }

    return eval(evaluatedExpression).toString();
  } catch (error) {
    return '#ERROR!';
  }
}