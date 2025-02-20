import { Workbook } from './workbook';

export class Application {
  private static instance: Application | null = null;
  private workbook: Workbook;

  private constructor() {
    this.workbook = Workbook.getInstance();
  }

  static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  getWorkbook(): Workbook {
    return this.workbook;
  }

  getAllWorkbooks(): Workbook[] {
    return [this.workbook];
  }

  removeWorkbook(id: string): void {
    if (this.workbook?.getId() === id) {
      this.workbook = Workbook.getInstance();
    }
  }

  toJSON() {
    return {
      workbook: this.workbook?.toJSON()
    };
  }

  static fromJSON(data: any): void {
    const app = Application.getInstance();
    if (data.workbook) {
      app.workbook = Workbook.fromJSON(data.workbook);
    }
  }
}
