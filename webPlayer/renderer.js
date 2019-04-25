const {app, dialog} = require('electron').remote;
const webpath = require('../config').webPath;
const publishPath = require('../config').publishPath;
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const {getIndex,addMetaTag,cleanFiles} = require('../main/tool');

const url = require('../config').serverUrl;
const iframe = document.querySelector('iframe');
const p = document.querySelector('div >p');
const select = document.querySelector('div>select');
const submit = document.querySelector('div>button');
const sideBar = document.querySelector('#sideBar');
const resultTable = document.querySelector('#result table');
const result = document.querySelector("#result");
const publish = document.querySelector("#publish");

const sideBarItems = [];
const directories = [];
let coursewares = [];
let resultArr = [];
let coursewareIndex = 0;
let submitFlag = 0;

Mousetrap.bindGlobal('left', function () {
    if (coursewares.length <= 0) return
    pre();
    return false;
})
Mousetrap.bindGlobal('right', function () {
    if (coursewares.length <= 0) return
    next();
    return false;
})


// iframe传参
window.addEventListener('message', function (e) {
    console.log(JSON.stringify(e.data));
    if (e.data.type === 'onload') {
        console.log('页面加载完毕');
    } else if (e.data.type === 'submitAnswer') {

        let testAnswer = e.data.data.testAnswer;
        let testNum = e.data.data.testNum;

        // 总的正确率
        let allRate = 0;
        // 答对总数
        let allRigetNum = 0;

        let gold = 0;

        for (let i = 0; i < testNum; i++) {
            if (testAnswer[i] === undefined) {
                continue;
            }

            let stuAnswerData = testAnswer[i];

            // 每道题的空数
            let answernum = stuAnswerData['answer'].length;
            if (typeof stuAnswerData['answer'] === 'string') {
                answernum = 1;
            }
            let isRightNum = stuAnswerData['rightnum'];

            console.log(typeof stuAnswerData['answer']);

            // 一个页面一共答对几道题
            if (stuAnswerData['isright']) {
                allRigetNum++;
            }

            if (isRightNum === 0 && stuAnswerData['type'] === 0) {
                gold++;
                isRightNum = 0;
            }

            if (isRightNum > 0 && stuAnswerData['type'] === 0) {
                isRightNum = answernum;
            }

            stuAnswerData['is_right'] = (isRightNum === answernum) ? 1 : 0;

            // 一道题的正确率
            stuAnswerData['rate'] = isRightNum / answernum;

            allRate += stuAnswerData['rate'];
        }

        // 用户答题平均正确率
        let average_rate = allRate / testNum;

        // 获取金币数，向上取整
        gold = gold + Math.ceil(10 * average_rate);

        gold = gold > 10 ? 10 : gold;

        // 更新数据
        submitCourseWareH5Answer({goldnum: gold, result: testAnswer});

    } else if (e.data.type === 'submitData') {
        // 强制提交
        submitData();
    } else if (e.data.type === "close") {
        resultFun();
    } else if(e.data.type === 'answer'){
        try {
            let postArr = e.data.data;
            resultArr.length = 0;
            postArr.forEach(function(answer,index){
                let userAnswerContent  = answer.userAnswerContent.map(function(item){return item.text}).join("，");
                let rightAnswerContent = answer.rightAnswerContent.map(function(item){return item.text}).join("，");
                let isRight = answer.isRight.map(function(item){return item == 1 ? item = '对' :item = "错"}).join("，");
                let id  = index+1;
                resultArr.push({
                                "id":id,
                                "userAnswerContent":userAnswerContent,
                                "rightAnswerContent":rightAnswerContent,
                                "isRight":isRight
                            })
            });
            showResultData();
        } catch (error) {
            alert("数据提交错误");
        }
        
    }
}, false);

submit.onclick = () => {
    submitData();
}

publish.onclick = ()=>{
    dialog.showOpenDialog({
        title:"保存路径",
        properties:['openDirectory']
    },(filePaths)=>{

        filePath = publishPath.replace(/\\/g,'/');
        getIndex(filePath);
        addMetaTag();
        cleanFiles();



        createPublishFiles(filePaths[0]);
    });
}

function createPublishFiles(filepath){
    try {
        fs.readdirSync(publishPath).forEach((v,i)=>{
            if(fs.statSync(path.join(publishPath,v)).isDirectory()){
                let dirname = i<9? "0"+(i+1):""+(i+1);
                fsExtra.copySync(path.join(publishPath,v), path.join(filepath,dirname));
            }
        })

        alert('发布完成');
    } catch (err) {
        throw err;
    }
}

function rename(path){

}

function showResultData(){
    clearResultData();
    if(resultArr.length>0){
        let resultTop = (resultArr.length+1)*-154+'px';
        result.style.top = resultTop;
        resultArr.forEach(v=>{
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            let td3 = document.createElement('td');
            let td4 = document.createElement('td');
            td1.innerText = v.id;
            td2.innerText = v.isRight;
            td3.innerText = v.userAnswerContent;
            td4.innerText = v.rightAnswerContent;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            resultTable.appendChild(tr);
        }) 
        setTimeout(()=>{
            result.style.top = 0;
        },0)
    }
}

function clearResultData(){
    const trs = document.querySelectorAll('#result tr');
    trs.forEach((v,i)=>{
        if(i!==0){
            resultTable.removeChild(v);
        }
    })
}

function hideResultData(){
    clearResultData();
    result.style.top = '-145px';
}

if (fs.existsSync(`${webpath}/infos.txt`)) {
    let infos = fs.readFileSync(`${webpath}/infos.txt`);
    infos = JSON.parse(infos);
    coursewares = infos.info;

    coursewares.forEach((value, index, arr) => {
        let option = document.createElement('option');
        option.setAttribute('value', index);
        option.innerHTML = value.url;
        select.appendChild(option);
    })

    select.style.display = 'inline';

    select.onchange = () => {
        coursewareIndex = select.selectedIndex;
        current();
    }

    pre();

} else if (fs.existsSync(`${webpath}/index.html`)) {
    play(`${url}/index.html`);

    select.style.display = 'none';

} else {
    select.style.display = 'none';
}

function showSideBarContent(){
    fs.readdir(webpath,(err,files)=>{
        if(err){
            console.log(err);
        }else{
            files.forEach((file,i)=>{
                if(fs.statSync(path.join(webpath,file)).isDirectory()){
                    directories.push(file);
                }
            })
            directories.forEach((file,i)=>{
                let item = document.createElement('div');
                sideBarItems.push(item);
                item.onclick = (e)=>{
                    p.innerHTML = `${i + 1}/${sideBarItems.length}`;
                    hideResultData();
                    play(path.join(url,file,'index.html'));
                    item.className = 'sideBarItem itemSelected';
                    clearOtherItemsStyle(i);
                }
                if(i===0){
                    play(path.join(url,file,'index.html'));
                    item.className = 'sideBarItem itemSelected';
                }else{
                    item.className = 'sideBarItem';
                }
                item.innerText = file;
                sideBar.appendChild(item);
            })
            p.innerHTML = `1/${sideBarItems.length}`;
        }
    })
}

showSideBarContent();

function clearOtherItemsStyle(index){
    sideBarItems.forEach((v,i)=>{
        if(index !== i){
            sideBarItems[i].className = 'sideBarItem';
        }
    })
}

function current() {
    play(`${url}/${coursewares[coursewareIndex]['url']}`);
    p.innerHTML = `${coursewareIndex + 1}/${coursewares.length}`;
}

function pre() {
    --coursewareIndex;
    if (coursewareIndex < 0) {
        coursewareIndex = 0;
    }

    current();
}

function next() {
    ++coursewareIndex;
    if (coursewareIndex >= coursewares.length) {
        coursewareIndex = coursewares.length - 1;
    }
    current();
}

function play(path) {
    iframe.setAttribute('src', path);
}


//强制提交方法
function submitData() {
    if (submitFlag === 1) {
        return;
    }
    // let data = {type: 'resubmitAnswer'};
    // iframe.contentWindow.postMessage(data, '*');

    let resubmitdata = {type: 'getAnswer'};
    iframe.contentWindow.postMessage(resubmitdata, '*');
}


function resultFun() {
    iframe.setAttribute('src', '');
}

function submitCourseWareH5Answer(data) {
    let d = {type: 'answerResult', data};
    iframe.contentWindow.postMessage(d, '*');
}





