import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import express, { Router } from "express";
import { createServerSeed, FairCal } from "../faircal.js";

const roulette_router = express.Router();

let games = [];

const bet_types = {
    "straight":{
        bet_type:"straight",
        nums:["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36"],
        payout:35
    },
    "first_column":{
        bet_type:"first_column",
        nums:["3","6","9","12","15","18","21","24","27","30","33","36"],
        payout:2
    },
    "second_column":{
        bet_type:"second_column",
        nums:["2","5","8","11","14","17","20","23","26","29","32","35"],
        payout:2
    },
    "third_column":{
        bet_type:"third_column",
        nums:["1","4","7","10","13","16","19","22","25","28","31","34"],
        payout:2
    },
    "1to12":{
        bet_type:"1to12",
        nums:["1","2","3","4","5","6","7","8","9","10","11","12"],
        payout:2
    },
    "13to24":{
        bet_type:"13to24",
        nums:["13","14","15","16","17","18","19","20","21","22","23","24"],
        payout:2
    },
    "25to36":{
        bet_type:"25to36",
        nums:["25","26","27","28","29","30","31","32","33","34","35","36"],
        payout:2
    },
    "odd":{
        bet_type:"odd",
        nums:["1","3","5","7","9","11","13","15","17","19","21","23","25","27","29","31","33","35"],
        payout:1
    },
    "even":{
        bet_type:"even",
        nums:["2","4","6","8","10","12","14","16","18","20","22","24","26","28","30","32","34","36"],
        payout:1
    },
    "red":{
        bet_type:"red",
        nums:["1","3","5","7","9","12","14","16","18","19","21","23","25","27","30","32","34","36"],
        payout:1
    },
    "black":{
        bet_type:"black",
        nums:["2","4","6","8","10","11","13","15","17","20","22","24","26","28","29","31","33","35"],
        payout:1
    },
    "1to18":{
        bet_type:"1to18",
        nums:["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18"],
        payout:1
    },
    "19to36":{
        bet_type:"19to36",
        nums:["19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36"],
        payout:1
    }
}

roulette_router.post("/bet", auth(),  async (req, res) =>
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
            
        if(gameIndex < 0 || this_game.roblox_id != user.roblox_id || !req.body.game_bets || Object.values(bet_types).length > 200){
            res.send("blocked");
            return
        }

        // Chose chip
        let game_result;   

        FairCal({serverseed:this_game.game_seed, clientseed:req.body.input_seed}, (result, seednohash, seedhash) => {
            game_result = result%37;
        }); 

        // calculate win/lose
        let win_amount = 0;
        let BET_amount = 0;

        for(let i = 0; i < req.body.game_bets.length; i++){

            let this_bet = req.body.game_bets[i];

            if(!bet_types[this_bet.bet_type] || !this_bet.bet_amount){
                res.send("blocked");
                return;
            }

            BET_amount += this_bet.bet_amount;

            if(bet_types[this_bet.bet_type].nums.find(_=>_===game_result.toString())){
                if(this_bet.bet_type == "straight" && this_bet.bet_place && this_bet.bet_place != game_result.toString())
                    continue;

                win_amount+=bet_types[this_bet.bet_type].payout*this_bet.bet_amount;
            }
        }

        console.log(win_amount);
        
        res.send({
            type: "success",
            game: this_game,
            game_result: game_result,
            win_amount: win_amount,
            bet_amount: BET_amount,
        })

        games.splice(gameIndex, 1);

    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

roulette_router.post("/create_game", auth(),  async (req, res) =>
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

roulette_router.post("/get_game", auth(),  async (req, res) =>
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

export { roulette_router };