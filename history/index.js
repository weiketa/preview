const fs = require('fs');
const path = require('path');
const jsonPath = path.resolve(__dirname, './index.json');

let list = [];

module.exports = {
    init() {
        let info = fs.readFileSync(jsonPath);
        info = JSON.parse(info);
        list = info.history.concat();
    },
    push(info) {
        if (list.indexOf(info) === -1) {
            if (list.length >= require('../config').historyMaxLength) {
                list.splice(0, 1);
            }
            list.push(info);
        }
    },
    get list() {
        return list
    },
    write() {
        let data = {
            history: list,
            time: Date.now(),
        }
        fs.writeFileSync(jsonPath, JSON.stringify(data), {flag: 'w+'});
    },
    remove(url) {
        if (list.length > 0) {
            let index = list.indexOf(url);
            if (index!==-1) {
                list.splice(index, 1);
            }
        }
    }
}