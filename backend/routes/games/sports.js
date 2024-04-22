import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import express, { response, Router } from "express";
import { validate_body } from "../../common.js";
import joi from "joi";
import { user_money_data } from "../user_money_system.js";
import { io } from "../../index.js";
import mongoose from "mongoose";
import { blance_notice } from "../user_money_system.js";
import { bet_notice } from "../extra/bets_notice.js";

const sport_game_router = express.Router();

const GAMES = [];

const BETS_schema = new mongoose.Schema
({
    roblox_id:
    {
        type: Number,
        required: true
    },
    robux_amount:
    {
        type: Number,
        required: true
    },
    game_id:
    {
        type:Number,
        required: true,
    },
    choosen:
    {
        type:String,
        required: true,
    },
    multi:
    {
        type:Number,
        required: true
    }
});

const sport_bets = mongoose.model("sport_bets", BETS_schema);

sport_game_router.post("/create_game", auth(true),  async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }
        
        GAMES.push(
        {
            game_id: new Date().getTime(),
            date: req.body.date,
            time: req.body.time,
            statusText: 'open for betting',
            teams: [req.body.team1, req.body.team2],
            cardsData: [
                {
                    cardHead: req.body.team1,
                    multi: req.body.team1multi,
                    points: 0
                },
                {
                    cardHead: 'Draw',
                    multi: req.body.drawmulti,
                    points: 0
                },
                {
                    cardHead: req.body.team2,
                    multi: req.body.team2multi,
                    points: 0
                }
            ],
        });

        io.to("crash").emit("sport_bet_anounce", GAMES);

        res.send("success");
    }

    catch (error)
    {
        res.send("An unexpected error occured");
    }
});

sport_game_router.post("/delete_game", auth(true),  async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }
        
        GAMES.splice(GAMES.findIndex(game => game.game_id === req.body.game_id), 1);

        await sport_bets.deleteMany({game_id: req.body.game_id});

        res.send("success");

        io.to("crash").emit("sport_bet_anounce", GAMES);
    }

    catch (error)
    {
        res.send("An unexpected error occured");
    }
});

sport_game_router.get("/get_games",  async (req, res) =>
{
    try
    {
        res.send(GAMES);
    }

    catch (error)
    {
        res.send("An unexpected error occured");
    }
});

sport_game_router.post("/change_game_status", auth(true),  async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }
        
        GAMES[GAMES.findIndex(game => game.game_id === req.body.game_id)].statusText = req.body.statusText;

        res.send("success");

        io.to("crash").emit("sport_bet_anounce", GAMES);
    }

    catch (error)
    {
        res.send("An unexpected error occured");
    }
});

sport_game_router.post("/win_game", auth(true),  async (req, res) =>
{
    try
    {
        if(!req.user.isAdmin){
            res.status("400").send("blocked");
            return;
        }
        const winners = await sport_bets.find({game_id: req.body.game_id, choosen: req.body.team})

        await Promise.all(winners.map(async (winner) => {
            await user_money_data.findOneAndUpdate({roblox_id: winner.roblox_id}, {$inc : {robux_balance : winner.robux_amount*winner.multi}});
            blance_notice(winner.roblox_id);
            bet_notice({game: "Sport", user: winner.roblox_id, bet: winner.robux_amount, multi: winner.multi, payout: winner.robux_amount*winner.multi})
        }));

        GAMES[GAMES.findIndex(game => game.game_id === req.body.game_id)].statusText = `${req.body.team} is the winner`;

        res.send("success");

        io.to("crash").emit("sport_bet_anounce", GAMES);
    }

    catch (error)
    {
        console.log(error);
        res.send("An unexpected error occured");
    }
});

sport_game_router.post("/bet_game", auth(true),  async (req, res) =>
{
    try
    {
        if (!validate_body(res, req, { robux_amount: joi.number().min(5).required(), choosen: joi.string().required(), game_id: joi.number().required()})) return;
        
        const game = GAMES.find(game => game.game_id === req.body.game_id);

        if(!game || game.statusText != "open for betting"){
            res.status("400").send("You can not bet on this game!");
            return;
        }

        const teamIndex = game.cardsData.findIndex(team => team.cardHead === req.body.choosen);

        if(teamIndex == -1){
            res.status("400").send("Blocked");
            return;
        }
        
        const user = req.return_user;
        req.body.robux_amount = parseInt(req.body.robux_amount);

        
        if(req.body.robux_amount < 10){
            res.status("400").send("Must greater than 10 R$");
            return;
        }

        let user_money = await user_money_data.findOne({roblox_id: user.roblox_id});

        if(user_money.robux_balance < req.body.robux_amount){
            res.status(400).send("Not enough balance!");
            return;
        }

        let user_bet = await sport_bets.findOne({game_id: req.body.game_id, roblox_id: user.roblox_id, choosen: req.body.choosen});
        if(user_bet){
            user_bet.robux_amount+=req.body.robux_amount;
            res.send("Success add more bet amount to your old bet");
        }else{
            user_bet = new sport_bets({
                robux_amount: req.body.robux_amount,
                choosen: req.body.choosen,
                game_id: req.body.game_id,
                roblox_id: user.roblox_id,
                multi: game.cardsData[teamIndex].multi
            })
            res.send("Success");
        }
        user_bet.save();

        GAMES[GAMES.findIndex(game => game.game_id === req.body.game_id)].cardsData[teamIndex].points += req.body.robux_amount;
        io.to("crash").emit("sport_bet_anounce", GAMES);

        user_money.robux_balance-=req.body.robux_amount;
        await user_money.save();
        blance_notice(user.roblox_id, user_money); 
        bet_notice({game: "Sport", user: user, bet: req.body.robux_amount, multi: game.cardsData[teamIndex].multi, payout: -req.body.robux_amount})
    }

    catch (error)
    {
        console.log(error);
        res.send("An unexpected error occured");
    }
});

export { sport_game_router, GAMES, sport_bets };