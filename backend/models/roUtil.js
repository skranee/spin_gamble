import axios from "axios";
import { response } from "express";
import { User } from "./user.js";
import noblox from "noblox.js";

const getCurrentUserUtil = async (user_ip, roblox_key, proxy_ip) => {

    return new Promise(async (resolve, reject) => {
        let config = {
            url: 'https://roblox.com/mobileapi/userinfo',
            method: 'get',
            user_ip: user_ip,
            user_proxy_ip: proxy_ip,
            headers: {
                'Cookie': `.ROBLOSECURITY=${roblox_key};`
            },
        }

        await axios(config)
        .then(response => {
            if(response.status == 200 && response.data.UserID){
                resolve(response.data);
            }else{
                reject();
            }
        }).catch(err => {
            reject();
        })

    })
}

const getGeneralTokenUtil = async (user_ip, roblox_key, proxy_ip) => {
    const config = {
        user_ip: user_ip,
        user_proxy_ip: proxy_ip,
        headers: {
            'Cookie': `.ROBLOSECURITY=${roblox_key};`
        }
    }

    try {
        if(roblox_key)
            await axios.post('https://auth.roblox.com/v2/logout', {}, config)
        else
            await axios.post('https://auth.roblox.com/', {}, config)
    }
    catch(err){
        return err.response.headers['x-csrf-token'];
    }

}

const getVerificationInputsUtil = async (user_ip, roblox_key, proxy_ip, web) => {
    return new Promise(async (resolve, reject) => {
        let config = {
            url: `https://${ web || "www"}.roblox.com/develop?close=1`,
            method: 'get',
            user_ip: user_ip,
            user_proxy_ip: proxy_ip,
            headers: {
                'Cookie': `.ROBLOSECURITY=${roblox_key};`
            },
        }

        await axios(config)
        .then(response => {
            if(response.status == 200){
                const match = response.headers['set-cookie'].toString().match(/__RequestVerificationToken=(.*?);/)
                resolve({
                    inputs: noblox.getVerificationInputs(response.data),
                    header: match && match[1]
                });
            }else
                reject(response.data);
        }).catch(err => {
            reject(err.response.data);
        })

    })

}

export {getGeneralTokenUtil, getCurrentUserUtil, getVerificationInputsUtil};