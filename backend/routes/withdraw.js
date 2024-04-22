import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import express, { response, Router } from "express";
import { validate_body } from "../common.js";
import { user_money_data } from "./user_money_system.js";
import * as mongo from 'mongodb';
import axios from "axios";
import mongoose from "mongoose";
import noblox from "noblox.js";
import { Item } from "../models/item.js";
import qs from 'qs';
import FormData from "form-data";
import fs from 'fs';
import { getVerificationInputsUtil, getGeneralTokenUtil } from "../models/roUtil.js";
import { parse } from "node-html-parser";
import { withdraw_list } from "./money_transaction.js";

const robux_withdraw_router = express.Router();

let withdrawing_users = [];

robux_withdraw_router.post("/user_gamepass_withdraw", auth(), async (req, res) =>
{
    try
    {
        if (!validate_body(res, req, { robux_amount: joi.number().required()})) return;

        const user = await User.findById(req.user._id).select("_id -__v");

        if(isNaN(req.body.robux_amount)){
            res.send('Blocked');
            return;
        }

        if(user.block_withraw){
            res.status(400).send('Admin limited your withdraw. Failed!');
            return;
        }

        req.body.robux_amount = parseInt(req.body.robux_amount);

        let user_balance = (await user_money_data.findOne({roblox_id: user.roblox_id})).robux_balance;

        if(req.body.robux_amount < 50 ){
            res.status(400).send(`Minimum withdraw: 50`);
            return;
        }

        if(user_balance < req.body.robux_amount ){
            res.status(400).send(`Maximum withdraw: ${user_balance}`);
            return;
        }

        withdraw_list.add(user.roblox_id, req.body.robux_amount);
        user_money_data.findOneAndUpdate({roblox_id: user.roblox_id}, {$inc : {robux_balance : -req.body.robux_amount}});

        res.send("success");
    }

    catch (error)
    {
        console.log(error);
        if(!res.headersSent)
            res.send("An unexpected error occured");
    }
});















////////////// limited item deposit/withdraw code

// this is to list limited items for user
const list_all_item = async (user, cursor) => {
    let next_cursor;
    let data=[];
    cursor=cursor||"";
    await axios.get(`https://inventory.roblox.com/v1/users/${user.roblox_id}/assets/collectibles?sortOrder=Asc&limit=100&cursor=${cursor}`).then(async response => {
        next_cursor=response.data.nextPageCursor;
        data.push(...response.data.data);
    });
    
    if(next_cursor){
        await list_all_item(user, next_cursor);
    }
    return data;
}

// this is use for item depositor
robux_withdraw_router.post("/list-item", auth(), async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("_id -__v");

/*      YOU CAN CHANGE USER SETTING EVERY REQUEST OR USE THIS FOR YOUR SYSTEM. THIS MUST BE IN. IN ORDER TO TRADE.
        // change allow trade with everyone setting
        let config = { user_ip: req.socket.remoteAddress,
            headers: {
                "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-"
            }
        }

        let body = qs.stringify({tradeValue:"None"});

        await axios.post(`https://accountsettings.roblox.com/v1/trade-privacy`, body, config).then(async response => {
            //res.send(response.data);
        }).catch(err => {
            res.status(err.response.status).send(err.response.data);
        });


        // change setting
        body = qs.stringify({tradePrivacy:"All"});

        await axios.post(`https://accountsettings.roblox.com/v1/trade-value`, body, config).then(async response => {
            //res.send(response.data);
        }).catch(err => {
            res.status(err.response.status).send(err.response.data);
        });

*/

        // call this first to get the changleng id
        if(req.body.ctype == "generate_id"){

            let config = { user_ip: req.socket.remoteAddress,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }

            let body = {};

            //solve a verification code
            let verification_type;

            await axios.get(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/configuration`, config).then(async response => {
                verification_type = response.data.primaryMediaType;
            });

            await axios.post(`https://trades.roblox.com/v1/trade-friction/two-step-verification/generate`, body, config).then(async response => {
                res.send({
                    verification_type: verification_type,
                    challengeId: response.data
                })
            });
        }

        if(req.body.ctype == "list"){

            let config = { user_ip: req.socket.remoteAddress,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }

            let body = {
                challengeId:req.body.challengeId,
                actionType:"ItemTrade",
                code:req.body.code
            };

            //solve a verification code
            let verification_token;

            if(req.body.verification_type == "Authenticator"){
                await axios.post(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/challenges/authenticator/verify`, body, config).then(async response => {
                    verification_token = response.data.verificationToken;
                });
            }else if(req.body.verification_type == "Email"){
                await axios.post(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/challenges/email/verify`, body, config).then(async response => {
                    verification_token = response.data.verificationToken;
                });
            }else{
                "only support two verification type otherwise tell user to add those and remove Security Keys on Web Only"
            }
            
            body = {
                challengeToken:req.body.challengeId,
                verificationToken:verification_token
            }

            await axios.post(`https://trades.roblox.com/v1/trade-friction/two-step-verification/redeem`, body, config).then(async response => {                    
            });

            // user will list the item userAssetIds they want to deposit(max 4 item) and you have to check if user_available_item have those userAssetIds
            let user_available_item = await list_all_item(user);
            // when checked you will save the listed to database
        }
    }

    catch(err){
        console.log(err.response.data);
        res.send('bb')
    }

})

// this is use for item withdrawer
robux_withdraw_router.post("/withdraw-item", auth(), async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("_id -__v");

/*      YOU CAN CHANGE USER SETTING EVERY REQUEST OR USE THIS FOR YOUR SYSTEM. THIS MUST BE IN. IN ORDER TO TRADE.
        // change allow trade with everyone setting
        let config = { user_ip: req.socket.remoteAddress,
            headers: {
                "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-"
            }
        }

        let body = qs.stringify({tradeValue:"None"});

        await axios.post(`https://accountsettings.roblox.com/v1/trade-privacy`, body, config).then(async response => {
            //res.send(response.data);
        }).catch(err => {
            res.status(err.response.status).send(err.response.data);
        });


        // change setting
        body = qs.stringify({tradePrivacy:"All"});

        await axios.post(`https://accountsettings.roblox.com/v1/trade-value`, body, config).then(async response => {
            //res.send(response.data);
        }).catch(err => {
            res.status(err.response.status).send(err.response.data);
        });

*/

        // call this first to get the changleng id
        if(req.body.ctype == "generate_id"){

            let config = { user_ip: req.socket.remoteAddress,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }

            let body = {};

            let verification_type;

            await axios.get(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/configuration`, config).then(async response => {
                verification_type = response.data.primaryMediaType;
            });

            await axios.post(`https://trades.roblox.com/v1/trade-friction/two-step-verification/generate`, body, config).then(async response => {
                res.send({
                    verification_type: verification_type,
                    challengeId: response.data
                })
            });
        }

        if(req.body.ctype == "withdraw"){

            let config = { user_ip: req.socket.remoteAddress,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }

            let body = {
                challengeId:req.body.challengeId,
                actionType:"ItemTrade",
                code:req.body.code
            };

            //solve a verification code
            let verification_token;

            if(req.body.verification_type == "Authenticator"){
                await axios.post(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/challenges/authenticator/verify`, body, config).then(async response => {
                    verification_token = response.data.verificationToken;
                });
            }else if(req.body.verification_type == "Email"){
                await axios.post(`https://twostepverification.roblox.com/v1/users/${user.roblox_id}/challenges/email/verify`, body, config).then(async response => {
                    verification_token = response.data.verificationToken;
                });
            }else{
                "only support two verification type otherwise tell user to add those and remove Security Keys on Web Only"
            }
            
            body = {
                challengeToken:req.body.challengeId,
                verificationToken:verification_token
            }

            await axios.post(`https://trades.roblox.com/v1/trade-friction/two-step-verification/redeem`, body, config).then(async response => {                    
            });

            // send trade from depositor with listed from data base
            config = { 
                user_ip: null,
                user_proxy_ip: "depositor_user.proxy_address", //proxy_address is in the user database it update when user login
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }

            // sample body
            body = {"offers":[
                {"userId":1824762672,"userAssetIds":[38690748176,60518349054],"robux":null},//depositor with listed items
                {"userId":582667169,"userAssetIds":[60104535230],"robux":null}]//withdrawer with only 1 dummy item 
            }

            let trade_id;

            await axios.post(`https://trades.roblox.com/v1/trades/send`, body, config).then(async response => {
                trade_id = response.data.id;
            }).catch(err => {
                // check err response if One or more userAssets are invalid. See fieldData for details. remove the listed item
                // if The trade reaches Two Step Verification thresholds and the user has not verified in the past time threshold. or something like depositor still have that listed items then don't remove them
            })

            //accept trade from withdrawer
            config = { 
                user_ip: req.socket.remoteAddress,
                user_proxy_ip: user.proxy_address,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(req.socket.remoteAddress, user.roblox_key),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }
            await axios.post(`https://trades.roblox.com/v1/trades/${trade_id}/accept`, {}, config).then(async response => {
                res.send(response.data);
                // add depositor balacne on site
            })
        }

        


    }

    catch(err){
        console.log(err);
        res.send('bb')
    }

})

export { robux_withdraw_router };