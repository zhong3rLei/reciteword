module.exports = {
    pwa: {
        name: 'word',
        themeColor: '#15161A',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',

        // 配置 workbox 插件
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            // swSrc 中 InjectManifest 模式下是必填的。
            swSrc: 'src/service-worker.js',
            importWorkboxFrom:'local'
        }
    },
    publicPath:'./',//根路径
    devServer: {
        open: true, //启动项目后自动开启浏览器
        host: '0.0.0.0', //对应的主机名
        port: 6065, //端口号
        https: false, //是否开启协议名,如果开启会发出警告
        hotOnly: false, //热模块更新的一种东西,webpack中自动有过配置,但如果我们下载一些新            的模块可以更好的给我更新一些配置
        proxy: {
            //配置跨域
            '/api/': {
                target: 'http://172.16.8.208:8081'
            }
            // '/api/saveLesson': {
            //     target: 'http://172.16.8.208:8081'
            // }
        }
    }
};