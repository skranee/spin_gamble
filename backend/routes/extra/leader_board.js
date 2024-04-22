import { User } from "../../models/user.js";
import { io } from "../../index.js";
import express, { response, Router } from "express";
import mongoose from "mongoose";

const leader_board_router = express.Router();

const leader_board_schema = new mongoose.Schema
({
    roblox_id: {
        type: Number
    },
    roblox_name: {
        type: String
    },
    avatar_url: {
        type: String
    },
    bet_amount: {
        type: Number
    },
    reward: {
        type: Number
    }
}, { timestamps: true });


const leader_board_data = await mongoose.model("leader_board_data", leader_board_schema);

leader_board_router.get("/table",  async (req, res) =>
{
    try
    {
        res.send(await leader_board_data.find({}).sort({bet_amount: -1}).limit(10).exec());
    }

    catch (error)
    {
        res.status(400).send("An unexpected error occured");
    }
});

const bet_to_leaderboard = async (user, bet_amount) => {
  try {
    let user_board = await leader_board_data.findOne({roblox_id: user.roblox_id});
    if(!user_board)
        user_board = new leader_board_data({
            roblox_id: user.roblox_id,
            roblox_name: user.roblox_name,
            avatar_url: user.avatar_url,
            bet_amount: 0,
            reward: 0,
        })
    user_board.bet_amount+=Math.abs(bet_amount);
    await user_board.save();

    io.to("crash").emit("leader_board_notice", await leader_board_data.find({}).sort({bet_amount: -1}).limit(10).exec()); 
  }catch{}
}

export { leader_board_router, bet_to_leaderboard };