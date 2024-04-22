import { User } from "../../models/user.js";
import { io } from "../../index.js";
import express, { response, Router } from "express";
import { bet_to_leaderboard } from "./leader_board.js";

const bets_notice_router = express.Router();

const BETS = [];

bets_notice_router.get("/bet_table",  async (req, res) =>
{
    try
    {
        res.send(BETS);
    }

    catch (error)
    {
        res.status(400).send("An unexpected error occured");
    }
});

const bet_notice = async (data) => {
  try {
    const user = await User.findOne({roblox_id: data.user.roblox_id ? data.user.roblox_id : data.user});

    if(data.payout)
        bet_to_leaderboard(user, data.payout);

    data = {
        user: user.roblox_name,
        user_avatar: user.avatar_url,
        game: data.game,
        bet: data.bet,
        multi: data.multi,
        payout: data.payout || data.bet*data.multi
    }
    BETS.push(data);

    io.to("crash").emit("bet_notice", BETS); 

    if(BETS.length > 6)
        BETS.shift();
  }catch{}
}

export { bet_notice,bets_notice_router };