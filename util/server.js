const fs = require('fs');
const mime = require('mime');
const url = require('url');
const path = require('path');
const http = require('http');

let server;
let hasServer = false;//服务已经启动
let {webPath,port} = require('../config')

module.exports = {
    createServer() {
        if (hasServer) return;
        server = http.createServer((req, res) => {
            let pathname = url.parse(req.url).pathname;
            let ex = path.extname(pathname);
            let ct = ex ? mime.lookup(ex) : "text/plain";
            let resStr;
            //这里需要转码，否则，'空格'会被转换成'%20'
            pathname = decodeURIComponent(pathname);
            try {
                resStr = fs.readFileSync(`${webPath}${pathname}`);
                res.writeHead(200, {'Content-Type': ct});
                res.write(resStr);
                res.end();
            } catch (err) {
                res.end();
            }

            

        });
        server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });
        server.listen(port);
        hasServer = true;

    }
}