# XO

``` mermaid
classDiagram
    class Spreadsheet {
        - List<Sheet> sheets
        + addSheet(name: String): void
        + getSheet(name: String): Sheet
        + removeSheet(name: String): void
    }

    class Sheet {
        - String name
        - List<List<Cell>> cells
        + getCell(row: int, col: int): Cell
        + setCell(row: int, col: int, value: String): void
    }

    class Cell {
        - String value
        - String formula
        + setValue(value: String): void
        + setFormula(formula: String): void
        + evaluate(): String
    }

    class FormulaParser {
        + parseFormula(formula: String, sheet: Sheet): String
    }

    class FileHandler {
        + openFile(path: String): Spreadsheet
        + saveFile(spreadsheet: Spreadsheet, path: String): void
        + exportToCSV(sheet: Sheet, path: String): void
    }

    Spreadsheet --> Sheet : contains
    Sheet --> Cell : contains
    Cell --> FormulaParser : uses
    Spreadsheet --> FileHandler : interacts
```