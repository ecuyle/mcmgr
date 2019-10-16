const fs = require('fs');

const shallowCopy = function(obj) {
    if (Array.isArray(obj)) {
        return obj.map(el => el);
    } else if (typeof obj === 'object' && !!obj) {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = obj[key];
        });
        return copy;
    }

    return obj;
};

module.exports = {
    shallowCopy,
};
