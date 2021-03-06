const fsExtra = require('fs-extra');
const {app} = require('electron').remote;
const fs = require('fs');
const ftp = require('ftp');

const webpath = require('../config').webPath;
const publishPath = require('../config').publishPath;
const rimraf = require('rimraf');

module.exports = {
    /**
     * 检测文件夹中的文件是否符合规定
     * @param filepath
     */
    checkDirectory(filepath) {

    },
    /**
     * 将文件copy到temp/web文件夹中
     * @param filepath
     */
    copyToWeb(filepath) {
        try {
            fsExtra.copySync(filepath, webpath)
        } catch (err) {
            throw err;
        }
    },

    copyToPublish(filepath){
        rimraf(publishPath,[`rmdir`],err=>{
            if (err) {
                throw err;
            }
            try {
                fsExtra.copySync(filepath, publishPath)
            } catch (err) {
                throw err;
            }
        })
        
    }
}

