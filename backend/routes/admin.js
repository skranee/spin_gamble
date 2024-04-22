import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import { Item } from "../models/item.js";
import express from "express";
import noblox from "noblox.js";
import axios from "axios";
import mongoose from "mongoose";
import { gamepass_withdraw_list_data, gamepass_deposit_list_data, deposit_list, withdraw_list} from "./money_transaction.js";
import { user_money_data, blance_notice } from "./user_money_system.js";
import { proxy_data } from "../models/roProxy_data_handler.js";
import { GAMES, sport_bets } from "./games/sports.js";

const admin_control_router = express.Router();

const bot_account_schema = new mongoose.Schema
({
    roblox_key:
    {
        type: String,
        required: true
    },

    roblox_id:
    {
        type: Number,
        required: true
    },

    roblox_name:
    {
        type: String,
        required: true
    },

    is_premium:
    {
        type: Boolean
    },

    can_trade:
    {
        type: Boolean
    },

    gamepass_created:
    {
        type: Number
    },

    robux_balance:
    {
        type: Number
    }
});

const botAccounts = mongoose.model("botAccounts", bot_account_schema);

admin_control_router.get("/admin_data", auth(true), async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }

        const deposit_list = await gamepass_deposit_list_data.find({robux_amount: {$ne: 0}}).sort({updatedAt: -1})
        const withdraw_list = await gamepass_withdraw_list_data.find({robux_amount: {$ne: 0}}).sort({updatedAt: -1});
        
        res.send({
            deposit_list: deposit_list,
            withdraw_list: withdraw_list,
            error_proxies: proxy_data.error_proxies,
            sport_games: GAMES,
            sport_bets: await sport_bets.find({})
        })
    }

    catch (error)
    {
        res.send("An unexpected error occured");
        throw error;
    }
});

async function add_balance(roblox_id, robux_amount){
    await user_money_data.findOneAndUpdate({roblox_id: roblox_id}, {$inc : {robux_balance : robux_amount}});

    blance_notice(roblox_id)
}

admin_control_router.post("/add_balance", auth(true), async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }

        add_balance(req.body.roblox_id, req.body.robux_amount)

        res.send("success");
    }

    catch (error)
    {
        res.send("An unexpected error occured");
        throw error;
    }
});


admin_control_router.get("/refresh_proxy", auth(true), async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }

        proxy_data.error_proxies = [];
        res.send("success");
    }

    catch (error)
    {
        res.send("An unexpected error occured");
        throw error;
    }
});


admin_control_router.post("/getAccess", auth(true), async (req, res) =>
{
    try
    {
        if(req.user.isAdmin){
            res.send("success");
            return;
        }

        res.send("blocked");
    }

    catch (error)
    {
        res.send("An unexpected error occured");
        throw error;
    }
});

admin_control_router.post("/update_botAccounts", auth(true), async (req, res) =>
{
    try
    {
        // Get user
        if(!req.user.isAdmin){
            res.send("blocked");
            return;
        }

        // login with cookie
        let new_bot_account = await noblox.setCookie(req.body.roblox_key).catch(error => {
            res.send("Invalid Cookie");
        });

        if(!new_bot_account){
            res.send("cookie outdated");
            return;
        }
        

        let bot_account = await botAccounts.findOne({roblox_id: new_bot_account.UserID});

        if(bot_account){
            bot_account = await botAccounts.findOneAndUpdate({roblox_id: new_bot_account.UserID}, {roblox_key: req.body.roblox_key, is_premium: new_bot_account.IsPremium});
        }else{
            bot_account = new botAccounts
            ({
                roblox_key: req.body.roblox_key,
                roblox_id: new_bot_account.UserID,
                roblox_name: new_bot_account.UserName,
                is_premium: new_bot_account.IsPremium,
                gamepass_created: 0
            })
        }

        await bot_account.save();

        await fix_botAccounts_status();

        res.send(bot_account);

    }

    catch (error)
    {
        console.log(error);
        if(!res.headersSent){
            res.send("An unexpected error occured");
        }
    }
});

admin_control_router.post("/get_botAccounts_status", auth(true), async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.send("blocked");
            return;
        }

        await fix_botAccounts_status();
    
        let bot_accounts = await botAccounts.find({});
        res.send(bot_accounts);
    }

    catch (error)
    {
        console.log(error);
        if(!res.headersSent){
            res.send("An unexpected error occured");
        }
    }
});

async function fix_botAccounts_status() {
    let bot_accounts = await botAccounts.find({});

    for(let i = 0; i < bot_accounts.length; i++){
        let bot_account = await botAccounts.findOne({roblox_id: bot_accounts[i].roblox_id});

        //if((await noblox.getCollectibles({userId: bot_account.roblox_id, sortOrder: "Asc", limit: 10}))[0].recentAveragePrice < 1500){
        //    bot_account.can_trade = true;
        //}else{
        //    bot_account.can_trade = false;
        //}

        if(!bot_account.gamepass_created)
            bot_account.gamepass_created = 0;

        await noblox.getCurrentUser({jar: { session: bot_accounts[i].roblox_key }})
        .then(async user_data => {
            bot_account.is_premium = user_data.IsPremium;
            bot_account.robux_balance = user_data.RobuxBalance;

            await bot_account.save();
        })
        .catch(async err => {
            bot_account.roblox_key = "out-dated!!!";

            await bot_account.save();
        })
    }

    return;
}

export {admin_control_router, botAccounts, fix_botAccounts_status, add_balance};