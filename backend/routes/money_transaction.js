import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import mongoose from "mongoose";
import { blance_notice, user_money_data } from "./user_money_system.js";
import axios from "axios";
import qs from 'qs';
import FormData from "form-data";
import fs from 'fs';
import noblox from "noblox.js";
import { getVerificationInputsUtil, getGeneralTokenUtil, getCurrentUserUtil } from "../models/roUtil.js";
import { resolve } from "path";


const gamepass_withdraw_list_schema = new mongoose.Schema
({
    roblox_id: {
        type: Number
    },
    robux_amount: {
        type: Number
    }
}, { timestamps: true });


const gamepass_withdraw_list_data = await mongoose.model("gamepass_withdraw_list_data", gamepass_withdraw_list_schema);

const gamepass_deposit_list_schema = new mongoose.Schema
({
    roblox_id: {
        type: Number
    },
    robux_amount: {
        type: Number
    }
}, { timestamps: true });


const gamepass_deposit_list_data = await mongoose.model("gamepass_deposit_list_data", gamepass_deposit_list_schema);

const withdraw_list = {
    add: async (roblox_id, robux_amount) => {
        let user = await gamepass_withdraw_list_data.findOne({roblox_id: roblox_id});

        if(!user)
            user = new gamepass_withdraw_list_data({
                roblox_id: roblox_id,
                robux_amount: robux_amount
            })
        else
            user.robux_amount += robux_amount;
    
        await user.save();
    },

    remove: async (roblox_id) => {
        await gamepass_withdraw_list_data.deleteOne({roblox_id: roblox_id})
    }
}

const deposit_list = {
    add: async (roblox_id, robux_amount) => {
        let user = await gamepass_deposit_list_data.findOne({roblox_id: roblox_id});

        if(!user)
            user = new gamepass_deposit_list_data({
                roblox_id: roblox_id,
                robux_amount: robux_amount
            })
        else
            user.robux_amount += robux_amount;
    
        await user.save();
    },

    remove: async (roblox_id) => {
        await gamepass_deposit_list_data.deleteOne({roblox_id: roblox_id})
    }
}

let gamepass_using = [];

const create_gamepass_image = (target_user, place_id) => {
    return new Promise(async (resolve, reject) => {
        try{
            const user = target_user;

            let RequestVerificationToken = await getVerificationInputsUtil(null, user.roblox_key, user.proxy_address) || await getVerificationInputsUtil(null, user.roblox_key, user.proxy_address, "web");
        
            var bodyFormData = new FormData();
        
            let image_file = fs.createReadStream('././files/Coin_Icon.png');
        
            let body = { 
                __RequestVerificationToken: RequestVerificationToken.inputs.__RequestVerificationToken,
                assetTypeId: 34,
                isOggUploadEnabled: 'true',
                groupId: '',
                onVerificationPage: 'true',
                captchaEnabled: 'false',
                captchaToken: '',
                captchaProvider: '',
                expectedCost: '',
                name: "Coin_Icon",
                description: (new Date()).getTime(),
                targetPlaceId: place_id
            }
        
            for (const key in body) {
                bodyFormData.append(key, body[key]);
            }
        
            bodyFormData.append('file', image_file);
        
            let config = {
                user_proxy_ip: user.proxy_address,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormData._boundary}`,
                    'Cookie': `.ROBLOSECURITY=${user.roblox_key}; __RequestVerificationToken=${RequestVerificationToken.header}`
                }
            }
        
            await axios.post(`https://roblox.com/build/verifyupload`, bodyFormData, config).then(async response => {
                body.assetImageId = (await noblox.getInputs(response.data, ["assetImageId"])).assetImageId;
            }).catch(err => {
            });
         
            resolve(body);
        }
        catch(err)
        {
            reject(err);
        }
        
    })
}

const create_gamepass = (target_user, place_id, assetImageId) => {
    return new Promise(async (resolve, reject) => {
        try{
            const user = target_user;

            let RequestVerificationToken = await getVerificationInputsUtil(null, user.roblox_key, user.proxy_address) || await getVerificationInputsUtil(null, user.roblox_key, user.proxy_address, "web");
        
            var bodyFormData = new FormData();
        
            let body = { 
                __RequestVerificationToken: RequestVerificationToken.inputs.__RequestVerificationToken,
                assetTypeId: 34,
                isOggUploadEnabled: 'true',
                groupId: '',
                onVerificationPage: 'true',
                captchaEnabled: 'false',
                captchaToken: '',
                captchaProvider: '',
                assetImageId: assetImageId,
                expectedCost: '',
                name: "darewithdraw",
                assetTypeId: 34,
                description: "buhu",
                targetPlaceId: place_id
            }
        
            for (const key in body) {
                bodyFormData.append(key, body[key]);
            }
        
            let config = {
                user_proxy_ip: user.proxy_address,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormData._boundary}`,
                    'Cookie': `.ROBLOSECURITY=${user.roblox_key}; __RequestVerificationToken=${RequestVerificationToken.header}`
                }
            }
        
            await axios.post(`https://roblox.com/build/doverifiedupload`, bodyFormData, config).then(async response => {
                body.gamepass_id = response.data.substring(response.data.search("uploadedId=")+11);
                body.gamepass_id = parseInt(body.gamepass_id.substring(0, body.gamepass_id.indexOf('"')));
            }).catch(err => {
                //console.log(err);
                res.status(400).send(err.response.data);
            });
                 
            resolve(body);
        }
        catch(err){reject(err)}
    });
}

const update_gamepass_data = (target_user, game_pass_id, price) => {
    return new Promise(async (resolve, reject) => {
        try{
            const user = target_user

            let config = {
                user_proxy_ip: user.proxy_address,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(null, user.roblox_key, user.proxy_address),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                }
            }
        
            let body = { 
                id: game_pass_id,
                price: price,
                isForSale: true
            }
        
            await axios.post(`https://roblox.com/game-pass/update`, body, config).then(async response => {
            }).catch(err => {
                res.status(400).send(err.response.data);
            });
        
            resolve(body);
        }catch(err){reject(err)}
    });
}

const send_robux = async (depositor, withdrawer, robux_amount) => {
    return new Promise(async (resolve) => {
        try
        {
            let user = await User.findOne({roblox_id: withdrawer});
            
            // select game
            let game_choosen;

            await axios({
                url: `https://develop.roblox.com/v1/search/universes?q=%20archived%3AFalse%20creator%3AUser&sort=-GameCreated&sortOrder=Desc&limit=10&cursor=`,
                method: 'get',
                user_ip: null,
                user_proxy_ip: user.proxy_address,
                headers: {
                    'Cookie': `.ROBLOSECURITY=${user.roblox_key};`
                }
            })
            .then(async response => {
                game_choosen = {
                    id: response.data.data[0].id,
                    rootPlace: {
                        id: response.data.data[0].rootPlaceId
                    }
                }
            })

            //select gamepass
            let game_pass_found;
            await axios.get(`https://games.roblox.com/v1/games/${game_choosen.id}/game-passes?sortOrder=Asc&limit=100`, {}).then(async response => {              
                game_pass_found = response.data.data.find(_ => _.name === "darewithdraw" && gamepass_using.indexOf(_.id) == -1);
                if(game_pass_found){
                    game_pass_found.gamepass_id = game_pass_found.id;
                    gamepass_using.push(game_pass_found.gamepass_id);
                }
            })

            if(!game_pass_found){
                // create gamepass
                let new_gamepass_assetImageId = (await create_gamepass_image(user, game_choosen.rootPlace.id)).assetImageId;
                game_pass_found = await create_gamepass(user, game_choosen.rootPlace.id, new_gamepass_assetImageId);
            }

            // update game pass price
            await update_gamepass_data(user, game_pass_found.gamepass_id, robux_amount);

            // re-defind gamepass
            await axios.get(`https://games.roblox.com/v1/games/${game_choosen.id}/game-passes?sortOrder=Asc&limit=100`, {}).then(async response => {              
                game_pass_found = response.data.data.find(_ => _.id === game_pass_found.gamepass_id);
                game_pass_found.gamepass_id = game_pass_found.id;
                gamepass_using.push(game_pass_found.gamepass_id);
            })

            // send robux
            user = await User.findOne({roblox_id: depositor});

            let config = { 
                user_proxy_ip: user.proxy_address,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(null, user.roblox_key, user.proxy_address),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-"
                }
            }

            let body = { 
                id: game_pass_found.gamepass_id
            }

            await axios.post(`https://roblox.com/game-pass/revoke`, qs.stringify(body), config).then(async response => {
                //res.send(response.data);
            }).catch(err => {
                //res.status(400).send(err.response.data);
            });

            config = {
                user_proxy_ip: user.proxy_address,
                headers: {
                    "X-Csrf-Token": await getGeneralTokenUtil(null, user.roblox_key, user.proxy_address),
                    Cookie: `.ROBLOSECURITY=${user.roblox_key}`,
                    "Content-Type": "application/json; charset=UTF-8"
                }
            }

            body = {
                "expectedCurrency":1,"expectedPrice":robux_amount,"expectedSellerId":game_pass_found.sellerId
            }

            await axios.post(`https://economy.roblox.com/v1/purchases/products/${game_pass_found.productId}`, body, config).then(async response => {
                if(response.data.purchased){
                    resolve(true);
                }else{
                    await gamepass_deposit_list_data.findOneAndUpdate({roblox_id: user.roblox_id}, {$inc : {robux_amount : -robux_amount}});
                    resolve(false);
                }
            })
            
            resolve(false);

            gamepass_using.splice(gamepass_using.indexOf(game_pass_found.gamepass_id), 1);

        }
        catch (err)
        {
            //console.log(err);
            resolve(false);
        }
    })
    
}

const paying_machine = (deposit_list, withdraw_list) => {
    let pay_requests = [];

    function checker(target, list, list_index, type){
        while(list[list_index] && target.robux_amount >= list[list_index].robux_amount){
            pay_requests.push({
                depositor: type == "depositor" ? target.roblox_id : list[list_index].roblox_id,
                withdrawer: type == "withdrawer" ? target.roblox_id : list[list_index].roblox_id,
                robux_amount: list[list_index].robux_amount
            })
            target.robux_amount-=list[list_index].robux_amount;
            list_index++;
        }

        return list_index;
    }

    let withdraw_list_index=0;
    let deposit_list_index = 0;
    let check_type = "withdrawer";

    while(deposit_list[deposit_list_index] && withdraw_list[withdraw_list_index]){
        if(check_type == "withdrawer"){
            deposit_list_index = checker(withdraw_list[withdraw_list_index], deposit_list, deposit_list_index, check_type);
        }else{
            withdraw_list_index = checker(deposit_list[deposit_list_index], withdraw_list, withdraw_list_index, check_type);
        }

        check_type = check_type == "withdrawer" ? "depositor" : "withdrawer";
    }
    
    return pay_requests;
}

const gamepass_paying_system = async () => {
    
    let deposit_list = await gamepass_deposit_list_data.find({robux_amount: {$ne: 0}}).sort({updatedAt: 1})
    let withdraw_list = await gamepass_withdraw_list_data.find({robux_amount: {$ne: 0}}).sort({updatedAt: 1});

    let pay_requests = paying_machine(deposit_list, withdraw_list);
    let paid_num = 0;

    await Promise.all(pay_requests.map(async (pay) => {
        try{      
            if(pay.withdrawer == pay.depositor){
                await gamepass_deposit_list_data.findOneAndUpdate({roblox_id: pay.depositor}, {$inc : {robux_amount : -pay.robux_amount}});
                await gamepass_withdraw_list_data.findOneAndUpdate({roblox_id: pay.withdrawer}, {$inc : {robux_amount : -pay.robux_amount}});
                paid_num++;
                return;
            } 
            let pay_success = await send_robux(pay.depositor, pay.withdrawer, pay.robux_amount);
    
            if(pay_success){
                await user_money_data.findOneAndUpdate({roblox_id: pay.depositor}, {$inc : {robux_balance : pay.robux_amount}});
    
                await gamepass_deposit_list_data.findOneAndUpdate({roblox_id: pay.depositor}, {$inc : {robux_amount : -pay.robux_amount}});
                await gamepass_withdraw_list_data.findOneAndUpdate({roblox_id: pay.withdrawer}, {$inc : {robux_amount : -pay.robux_amount}});
                
                blance_notice(pay.withdrawer);
                blance_notice(pay.depositor);
            }
            paid_num++;
        }catch(err)
        {
            console.log(err);
        }    
    }));

    while(paid_num < pay_requests.length){ }
    return true;
}

(async () => {
    while(true) await gamepass_paying_system()
})()

export { withdraw_list, deposit_list, gamepass_paying_system, gamepass_withdraw_list_data, gamepass_deposit_list_data};


  