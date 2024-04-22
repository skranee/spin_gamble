import axios from "axios";
import { User } from "../models/user.js";
import fetch from 'node-fetch';
import { proxy_data } from "../models/roProxy_data_handler.js";
import HttpsProxyAgent from 'https-proxy-agent';

const proxy_list = (await (await fetch('https://proxy.webshare.io/api/proxy/list', {method: 'get', headers: {"Authorization": "0r0vl31tgfqj3b43tn63wht77qydx3bf2e401m14"}})).json()).results;

axios.interceptors.request.use(async (config) => {
    let proxy_found;

    if(config.user_proxy_ip){
        proxy_found = proxy_list.find(_ => _.proxy_address === config.user_proxy_ip);
    }
    else if(config.user_ip){
        proxy_found = proxy_data.ip_online.find(_ => _.ip_address === config.user_ip).proxy;
    }else{
        return config;
    }


    const proxy = new HttpsProxyAgent(`http://${proxy_found.username}:${proxy_found.password}@${proxy_found.proxy_address}:${proxy_found.ports.http}`);

    config.httpsAgent = proxy;
    config.proxy = false;

    return config;
}, async (error) => {
    return Promise.reject(error);
});

export { proxy_list };
