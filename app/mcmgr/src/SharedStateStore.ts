import { Dictionary } from 'vue-router/types/router';
import { copy, isObject } from './utils';
import { SharedStateStoreInterface } from './types/SharedStateStore';

export class SharedStateStore implements SharedStateStoreInterface {
  private _sharedState: Dictionary<any>;

  constructor(schema: Dictionary<any>) {
    this._sharedState = copy(schema, true);
  }

  public get(keystr: string): any {
    return copy(this._get(keystr), true);
  }

  public set(keystr: string, val: any): boolean {
    const keySections: Array<string> = keystr.split('.');
    const targetKeyStr: string = keySections.pop() || '';
    const parentKeyStr: string = keySections.join('.');
    const parent: any = this._get(parentKeyStr) || null;

    if (!isObject(parent)) {
      return false;
    }

    parent[targetKeyStr] = copy(val, true);

    return true;
  }

  private _get(keystr: string): any {
    const keySections: Array<string> = keystr.split('.');
    let currentObject = this._sharedState;

    for (let i = 0; i < keySections.length; i++) {
      const key = keySections[i];

      if (!isObject(currentObject) || !currentObject.hasOwnProperty(key)) {
        return;
      }

      currentObject = currentObject[key];
    }

    return currentObject;
  }
}
