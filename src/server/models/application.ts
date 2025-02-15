import { Workbook } from './workbook';

export class Application {
  id: string;
  private workbooks: Map<string, Workbook>;
  private activeWorkbookId: string | null;

  constructor() {
    this.id = crypto.randomUUID();
    this.workbooks = new Map();
    this.activeWorkbookId = null;
  }

  createWorkbook(): Workbook {
    const workbook = new Workbook();
    this.workbooks.set(workbook.id, workbook);
    this.activeWorkbookId = workbook.id;
    return workbook;
  }

  getWorkbook(id: string): Workbook | undefined {
    return this.workbooks.get(id);
  }

  removeWorkbook(id: string): void {
    this.workbooks.delete(id);
    if (this.activeWorkbookId === id) {
      this.activeWorkbookId = null;
    }
  }

  getAllWorkbooks(): Workbook[] {
    return Array.from(this.workbooks.values());
  }

  setActiveWorkbook(id: string): void {
    if (this.workbooks.has(id)) {
      this.activeWorkbookId = id;
    }
  }

  getActiveWorkbook(): Workbook | undefined {
    return this.activeWorkbookId ? this.workbooks.get(this.activeWorkbookId) : undefined;
  }

  toJSON() {
    return {
      id: this.id,
      workbooks: Array.from(this.workbooks.entries()).map(([id, workbook]) => ({
        id,
        workbook: workbook.toJSON()
      })),
      activeWorkbookId: this.activeWorkbookId
    };
  }

  static fromJSON(data: any): Application {
    const app = new Application();
    app.id = data.id;
    data.workbooks.forEach(({ id, workbook }: any) => {
      app.workbooks.set(id, Workbook.fromJSON(workbook));
    });
    app.activeWorkbookId = data.activeWorkbookId;
    return app;
  }
}
