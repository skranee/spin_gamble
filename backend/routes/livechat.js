import express from "express";
import jwt from "jsonwebtoken";
import noblox from "noblox.js";
import { User } from "../models/user.js";
import { proxy_data } from "../models/roProxy_data_handler.js";
import { proxy_list } from "../middleware/roProxy.js";
import { getCurrentUserUtil } from "../models/roUtil.js";
import { commandOptions } from "redis";
import cookie from "cookie";
import { add_balance } from "./admin.js";
import { gamepass_withdraw_list_data, gamepass_deposit_list_data} from "./money_transaction.js";
import { adminAccounts } from "../models/settings.js";

const live_chat_router = express.Router();

let online_users = [];
let chats = [];
const cmds = ["!add_balance", "!mute", "!unmute", "!block_withdraw", "!allow_withdraw", "!rm_withdraw", "!rm_deposit"];
let mute_users = [];

let auth = async(client) => {
    try{
        const decoded = jwt.verify(cookie.parse(client.request.headers.cookie).token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select("_id -__v");
    
        return user;
    }catch(err){
        return null;
    }
    
}

function live_chat(io) 
{

    io.sockets.on("connection", async (socket) =>
    {
        //verify user
        let user = await auth(socket);
        if(user && !online_users.find(_ => _.roblox_id === user.roblox_id)) online_users.push(user);
        io.emit('online_users', online_users.length);

        socket.on('livechat', async function(reqdata){ 
            if(!user) return;
            let AvatarUrl = await noblox.getPlayerThumbnail(user.roblox_id, 420, "png", true, "Headshot");
            AvatarUrl = AvatarUrl[0].imageUrl;
            
            if(adminAccounts.find(_=>_===user.roblox_id) && cmds.find(_=>reqdata.message.search(_)!=-1)){
                reqdata.message=reqdata.message.split(" ");
                console.log(reqdata.message);
                try{
                    switch (reqdata.message[0]){
                        case "!add_balance":
                            add_balance(reqdata.message[1], reqdata.message[2]);
                            reqdata.message=`Added ${reqdata.message[2]}R$ to ${reqdata.message[1]}`
                            break;
                        case "!mute":
                            mute_users.push(reqdata.message[1])
                            reqdata.message=`Muted ${reqdata.message[1]}`
                            break;
                        case "!unmute":
                            mute_users.splice(mute_users.indexOf(reqdata.message[1]), 1);
                            reqdata.message=`Unmuted ${reqdata.message[1]}`
                            break;
                        case "!block_withdraw":
                            await User.findOneAndUpdate({roblox_name: reqdata.message[1]}, {block_withraw: true})
                            reqdata.message=`success`
                            break;
                        case "!allow_withdraw":
                            await User.findOneAndUpdate({roblox_name: reqdata.message[1]}, {block_withraw: false})
                            reqdata.message=`success`
                            break;
                        case "!rm_withdraw":
                            await gamepass_withdraw_list_data.findOneAndUpdate({roblox_id: reqdata.message[1]}, {robux_amount: 0})
                            reqdata.message=`success`
                            break;
                        case "!rm_deposit":
                            await gamepass_deposit_list_data.findOneAndUpdate({roblox_id: reqdata.message[1]}, {robux_amount: 0})
                            reqdata.message=`success`
                            break;
                    }

                }catch{
                    reqdata.message="Failed command!"
                }
            }

            if(mute_users.find(_=>_===user.roblox_name)) return;

            chats.push({
                image: AvatarUrl,
                name: user.roblox_name,
                rank: null,
                message: reqdata.message,
            })

            if(chats.length > 50){
                chats.shift();
            }
            io.emit('livechat', chats);
        }); 

        socket.on('disconnect', function(){
            if(proxy_data.ip_online.find(_ => _.ip_address === socket.request.connection.remoteAddress)){
                const proxy_found = proxy_data.ip_online.find(_ => _.ip_address === socket.request.connection.remoteAddress).proxy;

                proxy_data.proxy_using.splice(proxy_data.proxy_using.findIndex(_ => _ === proxy_found.proxy_address), 1);
                proxy_data.ip_online.splice(proxy_data.ip_online.findIndex(_ => _.ip_address === socket.request.connection.remoteAddress), 1);    
            }

            if(!user) return;

            online_users.splice(online_users.findIndex(_ => _.roblox_id === user.roblox_id), 1);
        })
    })

}

live_chat_router.post("/get_old_chats", (req, res) =>
{
    res.send(chats);
});

export { live_chat_router, live_chat };