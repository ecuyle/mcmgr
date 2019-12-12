export interface SharedStateStoreInterface {
    get(keystr: string): any;
    set(keystr: string, val: any): boolean;
}
