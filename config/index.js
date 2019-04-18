const {app}=process.type==='browser'?require('electron'):require('electron').remote;
const port=3000;
module.exports = {
    webPath: `${app.getPath('temp')}/web`,
    serverUrl:`http://localhost:${port}`,
    port,
    historyMaxLength:4,

};