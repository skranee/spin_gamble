import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import express, { Router } from "express";
import { createServerSeed, FairCal } from "../faircal.js";

const roll_router = express.Router();

let games = [];

roll_router.post("/bet", auth(),  async (req, res) =>
{
    try
    {
        // TODO: process bets :)
        // if (!validate_body(res, req, { zero: joi.number().min(1).required(), one: joi.number().min(1).required(), two: joi.number().min(1).required() })) return;
        
        // get user
        const user = await User.findById(req.user._id).select("_id -__v");

        // find game
        let gameIndex = games.findIndex(game => game.game_id === req.body.game_id);
        let this_game = games[gameIndex];
            
        if(gameIndex < 0 || this_game.roblox_id != user.roblox_id || !req.body.game_bets || req.body.game_bets.some(_ => typeof _ !== "number")){
            res.send("blocked");
            return
        }

        // Chose chip
        let game_result;   
        let win_amount = 0;

        FairCal({serverseed:this_game.game_seed, clientseed:req.body.input_seed}, (result, seednohash, seedhash) => {
            game_result = result%16;
        }); 

        // calculate win/lose
        if(game_result%15 == 0)
            win_amount += req.body.game_bets[2] * 14;
        else if(game_result%2 == 0)
            win_amount += req.body.game_bets[1] * 2;
        else
            win_amount += req.body.game_bets[0] * 2;

        res.send({
            type: "success",
            game: this_game,
            game_result: game_result,
            win_amount: win_amount,
            bet_amount: req.body.game_bets.reduce((a, b) => a + b, 0),
        })

        games.splice(gameIndex, 1);

    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

roll_router.post("/create_game", auth(),  async (req, res) =>
{
    try
    {
        // create game 

        const user = await User.findById(req.user._id).select("_id -__v");

        let server_seed,server_seed_hash;

        FairCal({serverseed:0, clientseed:0,}, (result, seednohash, seedhash) => {
            server_seed = seednohash;
            server_seed_hash = seedhash;
        });        

        if(games.findIndex(game => game.roblox_id === user.roblox_id) > -1){
            res.send("blocked");
            return;
        }

        let game_id = new Date().getTime();

        games.push({
            game_seed: server_seed,
            game_seed_hash: server_seed_hash,
            roblox_id: user.roblox_id,
            game_id: game_id
        })

        res.send({type:"success", game_seed_hash:server_seed_hash, game_id: game_id});
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

roll_router.post("/get_game", auth(),  async (req, res) =>
{
    try
    {
        // create game 

        const user = await User.findById(req.user._id).select("_id -__v");

        let this_game = games.find(game => game.roblox_id === user.roblox_id);

        if(!this_game){
            res.send("No game found");
            return;
        }

        res.send({type:"success", game_seed_hash:this_game.game_seed_hash, game_id: this_game.game_id});
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

export { roll_router };