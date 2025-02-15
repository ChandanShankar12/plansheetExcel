import { Workbook } from './workbook';

export class Application {
  id: string;
  private workbooks: Workbook[];
  private activeWorkbookId: string | null;

  constructor() {
    this.id = crypto.randomUUID();
    this.workbooks = [];
    this.activeWorkbookId = null;
    
    // Create initial workbook
    this.createWorkbook();
  }

  createWorkbook(): Workbook {
    // Only create a new workbook if none exists
    if (this.workbooks.length === 0) {
      const workbook = new Workbook();
      this.workbooks.push(workbook);
      this.activeWorkbookId = workbook.id;
      return workbook;
    }
    return this.workbooks[0];
  }

  getWorkbook(id: string): Workbook | undefined {
    return this.workbooks.find(wb => wb.id === id);
  }

  removeWorkbook(id: string): void {
    // Prevent removing the last workbook
    if (this.workbooks.length <= 1) {
      return;
    }
    
    const index = this.workbooks.findIndex(wb => wb.id === id);
    if (index !== -1) {
      this.workbooks.splice(index, 1);
      if (this.activeWorkbookId === id) {
        this.activeWorkbookId = this.workbooks[0]?.id || null;
      }
    }
  }

  getAllWorkbooks(): Workbook[] {
    return this.workbooks;
  }

  setActiveWorkbook(id: string): void {
    const workbook = this.getWorkbook(id);
    if (workbook) {
      this.activeWorkbookId = id;
    }
  }

  getActiveWorkbook(): Workbook | undefined {
    return this.activeWorkbookId ? this.workbooks.find(wb => wb.id === this.activeWorkbookId) : this.workbooks[0];
  }

  toJSON() {
    return {
      id: this.id,
      workbooks: this.workbooks.map(wb => ({
        id: wb.id,
        workbook: wb.toJSON()
      })),
      activeWorkbookId: this.activeWorkbookId
    };
  }

  static fromJSON(data: any): Application {
    const app = new Application();
    // Only take the first workbook from the data
    if (data.workbooks && data.workbooks.length > 0) {
      app.workbooks = [Workbook.fromJSON(data.workbooks[0].workbook)];
      app.activeWorkbookId = app.workbooks[0].id;
    }
    return app;
  }
}
