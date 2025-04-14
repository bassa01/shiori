declare module 'bun:sqlite' {
  export class Database {
    constructor(filename: string, options?: any);
    
    prepare(sql: string): Statement;
    exec(sql: string): any;
    transaction<T>(fn: () => T): T;
    close(): void;
  }

  export class Statement {
    run(...params: any[]): any;
    get(...params: any[]): any;
    all(...params: any[]): any;
    finalize(): void;
  }
}
