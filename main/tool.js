let fs = require('fs');
let arr = [];
let extArr = ['html','js','css','scss','less','json','md','txt','TXT','xml','XML','ttf','TTF','eot','otf','woff','png','PNG','jpg','PNG','gif','GIF','svg','atlas','mp3','ogg','wav','WAV','obj','OBJ','md5','MD5','mp4','MP4','avi','AVI','flv','webm','swf','atz','spz'];
let fileArr = [];
function getIndex(path){
    fs.readdirSync(path).forEach(function(item,index){
        if(fs.statSync(path+'/'+item).isDirectory()){
            getIndex(path+'/'+item);
        }else{
            if(item === 'index.html'){
                arr.push(path+'/'+item);
            }
            if(extArr.indexOf(item.split('.')[item.split('.').length-1]) === -1||item.indexOf('._')>-1){
                fileArr.push(path+'/'+item);
            }
        }
    })
    
}

function checkChineseFile(path){
    try {
        fs.readdirSync(path).forEach(function(item,index){
            if(fs.statSync(path+'/'+item).isDirectory()){
                checkChineseFile(path+'/'+item);
            }else{
                if(/.*[\u4e00-\u9fa5]+.*/.test(item)){
                    alert('文件名包含中文字符，请检查！');
                    throw new Error("ending");
                }
            }
        })
    } catch (error) {
        if(error.message == "ending"){
            window.publishState = 'chinese';
        }else{
            console.log(error.message);
        }
    }
    
}

function addMetaTag(){
    arr.forEach((item)=>{
        let html=fs.readFileSync(item).toString('utf8');
        let reg = /<meta[\W\w]*viewport[\W\w]*user-scalable=no/;
        console.log(reg.test(html));
        if(!reg.test(html)){
            htmlArr = html.split('<head>');
            if(htmlArr.length === 1){
                htmlArr = html.split('<head lang="en">');
            }
            let htmlStr = htmlArr[0]+'<head><meta name="viewport" content="width=device-width,initial-scale=1.0,maximu-scale=1.0 ,user-scalable=no">'+htmlArr[1];
            fs.writeFileSync(item, htmlStr);
        }
    });
}

function cleanFiles(){
    fileArr.forEach((item)=>{
        fs.unlinkSync(item);
    });
}

exports.getIndex = getIndex;
exports.addMetaTag = addMetaTag;
exports.cleanFiles = cleanFiles;
exports.checkChineseFile = checkChineseFile;


// filePath = '';

// const message = document.querySelector('#message');
// message.style.top = '10px';
// setTimeout(() => {
//     message.style.top = '-60px';
// }, 1000);

