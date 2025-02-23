import { Workbook } from './workbook';

export class Application {
  private static _instance: Application | null = null;
  private readonly _workbook: Workbook;

  private constructor() {
    // Only create workbook if it doesn't exist
    if (!this._workbook) {
      console.log('[Application] Initializing singleton instance');
      this._workbook = new Workbook();
      console.log('[Application] Created workbook instance');
    }
  }

  public static get instance(): Application {
    if (!Application._instance) {
      console.log('[Application] Creating new instance');
      Application._instance = new Application();
    } else {
      console.log('[Application] Reusing existing instance');
    }
    return Application._instance;
  }

  public getWorkbook(): Workbook {
    console.log('[Application] Getting workbook');
    return this._workbook;
  }

  public toJSON() {
    return {
      workbook: this._workbook.toJSON()
    };
  }

  public static fromJSON(data: any): void {
    if (!Application._instance) {
      Application._instance = new Application();
    }
    if (data?.workbook) {
      const workbook = Workbook.fromJSON(data.workbook);
      Application._instance._workbook.fromJSON(data.workbook);
    }
  }
}
