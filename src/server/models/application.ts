import { Workbook } from './workbook';

export class Application {
  private static _instance: Application;
  private static _workbook: Workbook; // Make workbook static

  private constructor() {
    if (!Application._workbook) {
      Application._workbook = new Workbook();
      const initialSheet = Application._workbook.addSheet('Sheet 1');
      console.log('Application initialized with sheet:', initialSheet.getId());
    }
  }

  public static get instance(): Application {
    if (!Application._instance) {
      Application._instance = new Application();
    }
    return Application._instance;
  }

  public getWorkbook(): Workbook {
    return Application._workbook;
  }

  public setWorkbook(workbook: Workbook): void {
    Application._workbook = workbook;
    if (workbook.getSheets().length === 0) {
      workbook.addSheet('Sheet 1');
    }
  }

  public toJSON() {
    return {
      workbook: Application._workbook.toJSON()
    };
  }

  public static fromJSON(data: any): void {
    if (!Application._instance) {
      Application._instance = new Application();
    }
    if (data?.workbook) {
      const workbook = Workbook.fromJSON(data.workbook);
      Application._instance.setWorkbook(workbook);
    }
  }
}
