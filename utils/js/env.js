let publicApi = ""
let webSocketServer = ""
let userInputHost = ''
let url = window.location.origin || window.location
console.log(url)
let force; // 强制使用哪个配置
//  SJH 支持本地连手机调试
if (url.indexOf('192.168.8.120') > 0) {
    force = 'localhost'
}
let mapop = url.match(/dev|sit|uat|localhost|elephantdr|qa/);
// switch (force || mapop ? mapop[0] : "elephantdr" || "dev") {
switch (force ? force : mapop ? mapop[0] : "elephantdr" || "dev") {
    case "localhost":
        publicApi = "https://uat-gateway.dr-elephant.net";
        webSocketServer = "https://uat-ws.dr-elephant.net/endpointWisely";
        userInputHost = 'http://uat-datacenter-gateway.dr-elephant.net:9700'
        break;
    case "dev":
        publicApi = "https://dev02-gateway.dr-elephant.net";
        webSocketServer = "https://dev02-ws.dr-elephant.net/endpointWisely";
        userInputHost = 'http://sit-datacenter-gateway.dr-elephant.net:9700'

        break;
    case "sit":
        publicApi = "https://uat-gateway.dr-elephant.net";
        webSocketServer = "https://uat-ws.dr-elephant.net/endpointWisely";
        userInputHost = 'http://uat-datacenter-gateway.dr-elephant.net:9700'

        break;
    case "uat":
        publicApi = "https://uat-gateway.dr-elephant.net";
        webSocketServer = "https://uat-ws.dr-elephant.net/endpointWisely";
        userInputHost = 'http://sit-datacenter-gateway.dr-elephant.net:9700'

        break;
    case 'elephantdr':
        publicApi = 'https://gateway.elephantdr.com'
        webSocketServer = 'https://ws.elephantdr.com'
        userInputHost = 'http://data-center-gateway.elephantdr.com:9700'
        break;
    default:
        publicApi = 'https://gateway.elephantdr.com'
        webSocketServer = 'https://ws.elephantdr.com'
        userInputHost = 'http://uat-datacenter-gateway.dr-elephant.net:9700'

}

export {
    publicApi,
    userInputHost,
    webSocketServer
}