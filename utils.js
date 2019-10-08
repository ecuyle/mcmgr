const fs = require('fs');

const mkdir = function(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

module.exports = {
    mkdir,
};
