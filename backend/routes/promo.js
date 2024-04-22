import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import express, { response, Router } from "express";
import { deposit_list } from "./money_transaction.js";
import { add_balance } from "./admin.js";

const promo_router = express.Router();

const got_list = [];
const code = "RbxspinOnTop"

promo_router.post("/redeem", auth(true), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user._id).select("_id -__v");

        if(req.body.code != "RbxspinOnTop"){
            res.send("Wrong Code!!!!!")
            return
        }

        if(got_list.find(_=>_===user.roblox_id)){
            res.send("No more robux for you!!!")
            return
        }

        got_list.push(user.roblox_id);

        add_balance(user.roblox_id, 25);

        res.send("Enjoy your 25R$");
    }

    catch (error)
    {
        console.log(error);
        if(!res.headersSent)
            res.send("An unexpected error occured");
    }
});


export { promo_router };