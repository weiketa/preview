const {app} = require('electron').remote;
const webpath = require('../config').webPath;
const fs = require('fs');

const url = require('../config').serverUrl;
const iframe = document.querySelector('iframe');
const p = document.querySelector('div >p');
const select = document.querySelector('div>select');
const submit = document.querySelector('div>button');

let coursewares = [];
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
    }
}, false);

submit.onclick = () => {
    submitData();
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
    let data = {type: 'resubmitAnswer'};
    iframe.contentWindow.postMessage(data, '*');
}


function resultFun() {
    iframe.setAttribute('src', '');
}

function submitCourseWareH5Answer(data) {
    let d = {type: 'answerResult', data};
    iframe.contentWindow.postMessage(d, '*');
}





