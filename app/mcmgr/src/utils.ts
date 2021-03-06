export const isUndefinedOrNull: Function = function(obj: any): boolean {
  return obj === null || obj === undefined;
};

export const copy = function(obj: any, isDeep: boolean = false): any {
  if (Array.isArray(obj)) {
    return obj.map((el: any) => {
      return isDeep ? copy(el, isDeep) : el;
    });
  } else if (typeof obj === 'object' && !!obj) {
    const clone: Record<string, any> = {};

    Object.keys(obj).forEach((key: any) => {
      clone[key] = isDeep ? copy(obj[key], isDeep) : obj[key];
    });

    return clone;
  }

  return obj;
};

export const isObject = function(obj: any): boolean {
  return typeof obj === 'object' && !!obj && !Array.isArray(obj);
};

export const BASE_IP: string = '192.168.0.76:3000/api';
export const HTTP_BASE_ADDR: string = `http://${BASE_IP}`;
export const WS_BASE_ADDR: string = `ws://${BASE_IP}`;
