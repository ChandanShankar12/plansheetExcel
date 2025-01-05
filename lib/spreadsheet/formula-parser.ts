type FormulaContext = Record<string, string>;

export function parseFormula(formula: string, context: FormulaContext): string {
  if (!formula.startsWith('=')) return formula;

  try {
    const expression = formula.substring(1);
    const evaluatedExpression = expression.replace(/[A-Z]\d+/g, (match) => {
      const value = context[match] || '0';
      return value.startsWith('=') ? parseFormula(value, context) : value;
    });

    if (!/^[\d\s+\-*/().]+$/.test(evaluatedExpression)) {
      throw new Error('Invalid formula');
    }

    return eval(evaluatedExpression).toString();
  } catch (error) {
    return '#ERROR!';
  }
}