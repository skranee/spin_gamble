import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import NanoTimer from 'nanotimer';
import express from "express";
import { validate_body } from "../../common.js";
import joi from "joi";
import { createServerSeed, FairCal } from "../faircal.js";
import { user_money_data, blance_notice } from "../user_money_system.js";
import crypto from "crypto";
import PollingBlockTracker from "btc-block-tracker";
import { bet_notice } from "../extra/bets_notice.js";

const blockTracker = new PollingBlockTracker({pollingInterval : 600000})

const crash_router = express.Router();
const timer = new NanoTimer();
const speed = 0.5;

let server_seed;
let server_seed_hash;

FairCal({serverseed:0, clientseed:0,}, (result, seednohash, seedhash) => {
    server_seed = seednohash;
    server_seed_hash = seedhash;
});

// Game state
const inter_round_delay = 15;
let start_date;
let clients = [];
let roundDoing = false;
let end_date;
let IO; 

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}
  
function multiplier_to_delay(multiplier)
{
    //return Math.log((multiplier-1)/0.044)/Math.log(1.886)*1000; 
    return getBaseLog(1.05, multiplier)*1000;
}

function time_to_multiplier(time)
{
    return Math.pow(1.05, time/1000);
}

function crashPointFromHash(hash) {
    // see: provably fair seeding event
    var hash = hash.toString();

    // In 4 of 100 games the game crashes instantly.
    if (divisible(hash, 25)) return (1.0).toFixed(2);

    // Use the most significant 52-bit from the hash to calculate the crash point
    var h = parseInt(hash.slice(0, 52 / 4), 16);
    var e = Math.pow(2, 52);

    return (Math.floor(((e - h / 50) / (e - h)) * 100) / 100).toFixed(2);
}

async function hash_chain(old_seed) {
    const gameHash = old_seed

    const hmac = crypto.createHmac('sha256', gameHash);

    // blockHash is the hash of bitcoin block 584,500

    hmac.update((await blockTracker.getLatestBlock()).toString());

    const hex = hmac.digest('hex')
    return hex;
}

function divisible(hash, mod) {
    // So ABCDEFGHIJ should be chunked like  AB CDEF GHIJ
    var val = 0;

    var o = hash.length % 4;
    for (var i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
        val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
    }

    return val === 0;
}

async function crash_do_round(io) 
{
    IO = io;
    // Work out crash multiplier based on chance
    server_seed = await hash_chain(server_seed);

    const multiplier = crashPointFromHash(server_seed);
    // Work out how long to wait
    const delay = multiplier_to_delay(multiplier) < 0 ? 0 : multiplier_to_delay(multiplier);
    end_date = new Date(new Date().getTime() + delay);

    // Begin
    start_date = new Date();
    io.to("crash").emit("crash_game_begin", { date: start_date.getTime(), clients: clients, game_seed_hashed: crypto.createHmac('sha256', server_seed).digest('hex').toString()});
    roundDoing = true;

    const interval = timer.setInterval(() => {
        Promise.all(clients.map(async (user) => {
            let multiplier = time_to_multiplier(new Date().getTime() - start_date.getTime());
            if(user.cash_out > multiplier)
                return;

            clients.splice(clients.findIndex(_ => _.roblox_id === user.roblox_id), 1);

            const user_money = await user_money_data.findOne({roblox_id: user.roblox_id});
            user_money.robux_balance+=user.bet_amount*user.cash_out;
            user_money.save();
           
            bet_notice({game: "Crash", user: user, bet:user.bet_amount, multi: user.cash_out})
            blance_notice(user.roblox_id, user_money);
        }))
        
    }, "", 1000000 + "n")

    // Wait
    await new Promise(resolve => timer.setTimeout(resolve, "", delay*1000000 + "n"));
    timer.clearInterval(interval);

    roundDoing = false;

    end_date = new Date().getTime();

    // Issue crash
    io.to("crash").emit("crash_game_crash", {end_date: end_date, next_round_delay: inter_round_delay, game_seed: server_seed, result: multiplier });

    FairCal({serverseed:server_seed, clientseed:0,}, (result, seednohash, seedhash) => {
        server_seed = seednohash;
        server_seed_hash = seedhash;
    });
    

    // Reset clients
    clients = []

    // Wait
    await new Promise(resolve => timer.setTimeout(resolve, "", inter_round_delay + "s")); 
}

crash_router.get("/status", auth(), (_, res) =>
{
    res.send(JSON.stringify({server_seed_hash: server_seed_hash, start_date: start_date, clients: clients, inter_round_delay: inter_round_delay, roundDoing: roundDoing}));
});

crash_router.post("/bet", auth(true),  async (req, res) =>
{
    try
    {
        if (!validate_body(res, req, { bet_amount: joi.number().min(5).required(), cash_out: joi.number().min(1.1).required()})) return;
        const user = req.return_user;

        // Check for duplicates
        if (roundDoing || clients.find(_ => _.roblox_id == user.roblox_id))
        {
            res.status(400).send("blocked");
            return;
        }

        // add the clients
        clients.push({roblox_id: user.roblox_id, bet_amount: req.body.bet_amount, cash_out: req.body.cash_out});

        // get user data
        let user_money = await user_money_data.findOne({roblox_id: user.roblox_id});

        if(user_money.robux_balance < req.body.bet_amount){
            res.status(400).send("Not enough balance!");
            return;
        }

        user_money.robux_balance-=req.body.bet_amount;

        user_money.save();
        
        ///////
        res.send("success");

        user_money = await user_money_data.findOne({roblox_id: user.roblox_id});
        user_money.robux_balance-=req.body.bet_amount;
        user_money.save();
        
        bet_notice({game: "Crash", user: user, bet: req.body.bet_amount, multi: req.body.cash_out, payout: -req.body.bet_amount})
        blance_notice(user.roblox_id, user_money);
    }

    catch (error)
    {
        console.error(error);
        res.status(400).send("An unexpected error occured");
    }
});

crash_router.post("/cash_out", auth(true),  async (req, res) =>
{
    try
    {
        let time_cashout = new Date().getTime() - start_date.getTime();
        let multiplier = time_to_multiplier(time_cashout);

        const user = await User.findById(req.user._id).select("_id -__v");
        if(!roundDoing || !clients.find(_ => _.roblox_id === user.roblox_id)){
            res.status(400).send("blocked"); return;
        }   

        let client = clients.find(_ => _.roblox_id === user.roblox_id);
        
        clients.splice(clients.findIndex(_ => _.roblox_id === user.roblox_id), 1);

        let user_money = await user_money_data.findOne({roblox_id: user.roblox_id});
        user_money.robux_balance+=client.bet_amount*multiplier;
    
        bet_notice({game: "Crash", user: user, bet:client.bet_amount, multi: parseFloat(multiplier.toFixed(2))})
        blance_notice(user.roblox_id, user_money);

        res.send("sucess");
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

export { crash_router, crash_do_round };