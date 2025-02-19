import { Workbook } from './workbook';

export class Application {
  private workbooks: Map<string, Workbook>;
  private activeWorkbookId: string | null;
  private static instance: Application;

  private constructor() {
    this.workbooks = new Map();
    this.activeWorkbookId = null;
    
    // Create initial workbook
    this.createWorkbook();
  }

  static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  createWorkbook(): Workbook {
    const workbook = new Workbook();
    this.workbooks.set(workbook.id, workbook);
    if (!this.activeWorkbookId) {
      this.activeWorkbookId = workbook.id;
    }
    return workbook;
  }

  getWorkbook(id: string): Workbook | undefined {
    return this.workbooks.get(id);
  }

  removeWorkbook(id: string): void {
    if (this.workbooks.size <= 1) return;
    
    if (this.workbooks.has(id)) {
      this.workbooks.delete(id);
      if (this.activeWorkbookId === id) {
        this.activeWorkbookId = this.workbooks.keys().next().value || null;
      }
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
    if (this.activeWorkbookId) {
      return this.workbooks.get(this.activeWorkbookId);
    }
    return this.workbooks.values().next().value;
  }

  toJSON() {
    return {
      workbooks: Array.from(this.workbooks.entries()).map(([id, workbook]) => ({
        id,
        workbook: workbook.toJSON()
      })),
      activeWorkbookId: this.activeWorkbookId
    };
  }

  static fromJSON(data: any): void {
    const app = Application.getInstance();
    app.workbooks.clear();
    
    if (data.workbooks) {
      data.workbooks.forEach(({ id, workbook }: any) => {
        const reconstructedWorkbook = Workbook.fromJSON(workbook);
        app.workbooks.set(id, reconstructedWorkbook);
      });
    }

    if (data.activeWorkbookId && app.workbooks.has(data.activeWorkbookId)) {
      app.activeWorkbookId = data.activeWorkbookId;
    } else if (app.workbooks.size > 0) {
      app.activeWorkbookId = app.workbooks.keys().next().value;
    }
  }
}
