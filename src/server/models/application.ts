import { Workbook } from './workbook';

export class Application {
  private static _instance: Application | null = null;
  private readonly _workbook: Workbook;

  private constructor() {
    console.log('[Application] Constructor called, instance exists?', !!Application._instance);
    
    if (Application._instance) {
      console.log('[Application] Returning existing instance');
      return Application._instance;
    }

    console.log('[Application] Creating new instance');
    this._workbook = new Workbook();
    Application._instance = this;
  }

  public static get instance(): Application {
    if (!Application._instance) {
      new Application();
    }
    return Application._instance!;
  }

  public getWorkbook(): Workbook {
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
