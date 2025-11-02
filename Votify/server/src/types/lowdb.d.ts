declare module 'lowdb' {
  export class Low<T> {
    constructor(adapter: any, defaultData?: T);
    read(): Promise<void>;
    write(): Promise<void>;
    data: T;
  }
}

declare module 'lowdb/node' {
  export class JSONFile<T> {
    constructor(filename: string);
  }
}
