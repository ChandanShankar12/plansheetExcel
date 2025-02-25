import { Workbook } from './workbook';

export class Application {
  private _workbook: Workbook;
  private _version: string;
  private readonly _companyId: string;
  private _initialized: boolean = false;

  constructor(companyId: string = 'Coho.', version: string = '1.0.0') {
    console.log('[Application] Constructor called');
    this._companyId = companyId;
    this._version = version;
    this._workbook = new Workbook();
  }

  /**
   * Initialize the application and its components
   */
  public async initialize(): Promise<void> {
    if (this._initialized) {
      console.log('[Application] Already initialized');
      return;
    }

    console.log('[Application] Starting initialization');
    try {
      // Initialize workbook
      await this._workbook.initialize();
      
      this._initialized = true;
      console.log('[Application] Initialization complete');
    } catch (error) {
      console.error('[Application] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the application version
   */
  public get version(): string {
    return this._version;
  }

  /**
   * Set the application version
   */
  public set version(value: string) {
    this._version = value;
  }

  /**
   * Get the company ID (readonly)
   */
  public get companyId(): string {
    return this._companyId;
  }

  /**
   * Get the workbook instance
   */
  public get workbook(): Workbook {
    return this._workbook;
  }

  /**
   * Convert application state to JSON
   */
  public toJSON() {
    return {
      version: this._version,
      companyId: this._companyId,
      workbook: this._workbook.toJSON(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restore application state from JSON
   */
  public fromJSON(data: any): void {
    console.log('[Application] Restoring from JSON');
    try {
      if (data?.workbook) {
        this._workbook.fromJSON(data.workbook);
        console.log('[Application] Workbook state restored');
      }
      if (data?.version) {
        this._version = data.version;
      }
    } catch (error) {
      console.error('[Application] Failed to restore from JSON:', error);
      throw error;
    }
  }
}
