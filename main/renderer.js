// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {app, BrowserWindow} = require('electron').remote;
const {ipcRenderer} = require('electron');
const fs = require('fs');
const AdmZip = require('adm-zip');//解压
const rimraf = require('rimraf');//删除文件夹
const path = require('path');
const file = require('../util/file');

const webpath = require('../config').webPath;
const holder = document.getElementById('holder');

let webPlayer;
let history = require('../history');
let ul = document.querySelector('.container >ul')

history.init();
refreshHistoryDom();

function refreshHistoryDom() {
    let historyList = history.list;
    while (ul.children.length > 0) {
        ul.children[0].onclick = null;
        ul.removeChild(ul.children[0]);
    }

    historyList.forEach((value, index, arr) => {
        let li = document.createElement('li');
        li.innerHTML = value;
        li.style['user-slect'] = 'none';
        li.style['cursor'] = 'pointer';
        li.onclick = (e) => {

            if (fs.existsSync(value)) {
                open(value);
            } else {
                history.remove(value);
                ul.removeChild(e.target);
                e.target.onclick = null;
            }
        }
        ul.appendChild(li);
    })
}


holder.ondragover = function () {
    this.className = 'hover';
    return false;
};
holder.ondragleave = holder.ondragend = function () {
    this.className = '';
    return false;
};
holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    var f = e.dataTransfer.files[0];
    
    open(f.path);


    return false;
};

function open(url) {
    var ext = path.extname(url);
    rimraf(webpath, [`rmdir`], (err) => {
        if (err) {
            throw err;
        }
        if (fs.statSync(url).isDirectory()) {
            file.copyToWeb(url)
        } else {
            let zip = new AdmZip(url);
            try {
                zip.extractAllTo(webpath, true);
            } catch (err) {
                throw err;
            }
        }

        if (fs.existsSync(`${webpath}/infos.txt`)
            || fs.existsSync(`${webpath}/index.html`)) {

            createWebPlayer();
            history.push(url);
            refreshHistoryDom();

        } else {
            alert('文件夹中没有info.txt文件，也没有index.html文件，请检查文件夹是否正确？')
        }
    });
}


function createWebPlayer() {
    let p = path.resolve(__dirname, `../webPlayer/index.html`);

    if (webPlayer) {
        webPlayer.close()
    }

    webPlayer = new BrowserWindow({width: 800, height: 600});
    webPlayer.on('close', () => {
        history.write();
        webPlayer = null;
    })

    webPlayer.loadURL(`file://${p}`)

}





