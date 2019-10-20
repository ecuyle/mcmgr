export const shallowCopy = function(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map((el: any) => el);
    } else if (typeof obj === 'object' && !!obj) {
        const copy: object = {};
        Object.keys(obj).forEach((key: any) => {
            copy[key] = obj[key];
        });
        return copy;
    }

    return obj;
};
