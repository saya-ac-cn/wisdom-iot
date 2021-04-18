//const proxy = require('http-proxy-middleware');//0.x.x版本的引用方式
const { createProxyMiddleware } = require('http-proxy-middleware');//1.0.0版本的引用方式
const dev = "http://127.0.0.1:8000";
const pro = "http://laboratory.saya.ac.cn";
const url = dev;
// 配置多个跨域设置
//重要说明！！！
//页面路由绝对禁止出现/backend1、/frontend、/warehouse（远景包括map）
//在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
module.exports = function (app) {
    // ...You can now register proxies as you wish!
    app.use(createProxyMiddleware('/backend/**', {
        target: url,
        changeOrigin: true,
    }));
    app.use(createProxyMiddleware('/frontend/**', {
        target: url,
        changeOrigin: true,
    }));
    app.use(createProxyMiddleware('/warehouse/**', {
        target: url,
        changeOrigin: true,
    }));
};
