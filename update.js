const http = require('http');
const path = require('path');
const fs = require('fs');
const request = require('request');

const baseUrl = 'http://icourse.xesimg.com/yulangongju/';
let mainInfo = null;
let mainApp = null;
let newVersionInfo = null;

function getHttpData(filepath,success,error){
    success = success || function(){};
    error = error || function(){};

    let url = baseUrl+filepath;  

    http.get(url,(res)=>{
        let statusCode = res.statusCode;
        if(statusCode !== 200){
            error();
            res.resume();
            return;
        }

        let fileData = '';
        res.setEncoding('utf8');
        res.on('data',(chunk)=>{
            fileData += chunk;
        })

        res.on('end',()=>{
            success(fileData);
        }).on('error',()=>{
            error();
        });
        
    });

}
//v1本地版本，v2线上版本
function checkVersion(v1,v2){
    let native_version = parseInt(v1.replace(/\./g,""));
    let online_version = parseInt(v2.replace(/\./g,""));

    if(native_version<online_version){
        return true;
    }
    return false;
}

function updateApp(appversion,mainWindow,app){
    mainInfo = mainWindow;
    mainApp = app;
    getHttpData('update.json',data=>{
        let info = JSON.parse(data);
        newVersionInfo = info;
        if(checkVersion(appversion,info.version)){
            showInfo("show_update",JSON.stringify(info.detail));
        }else{
            showInfo("up_to_date");
        }
      })
}

function startUpdate(){
    showInfo("start_update");
    updateFiles(newVersionInfo.files);
}

function updateFiles(files){
    let ps = [];
    files.forEach(file => {
        let promise = new Promise((resolve,reject)=>{
            let pathArr = file.indexOf("/") !== -1? file.split("/"):[]; 
            let filepath = "";
            let _path;
            for(let i=0;i<pathArr.length-1;i++){
                filepath += `/${pathArr[i]}`;
                _path = path.join(__dirname,filepath);
                if(!fs.existsSync(_path)){
                    fs.mkdirSync(_path);
                }
            }
            let writeStream=fs.createWriteStream(path.join(__dirname,file),{autoClose:true});
            request(baseUrl+file).pipe(writeStream);
            writeStream.on('finish',function(){
                resolve('done');
            })
        });
        ps.push(promise);
    });

    Promise.all(ps).then(values=>{
        updatePackageFile();
    },()=>{
        showInfo("update_fail");
    })
}

function showInfo(info,detail){
    mainInfo.webContents.send('info',info,detail);
}

function updatePackageFile(){
    fs.readFile(__dirname+"/package.json", 'utf-8', (err, data) =>{
        if(err) {
            return console.log('读取package.json文件失败');
        } 
        let info = JSON.parse(data);
        info.version = newVersionInfo.version;
        info.manifest.push(newVersionInfo);
        let info_str = JSON.stringify(info);
        fs.writeFile(__dirname+"/package.json",info_str,(err)=>{
            if(err){
                return console.log("写package.json文件失败");
            }
            //延长更新时间
            setTimeout(()=>{
                showInfo("update_done"); 
            },2000);
        })
    });
}

function restartApp(){
    mainApp.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    mainApp.exit(0)
}

exports.restartApp = restartApp;
exports.startUpdate = startUpdate;
exports.updateApp = updateApp;