import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import express, { response, Router } from "express";
import { getCurrentUserUtil } from "../models/roUtil.js";
import { deposit_list } from "./money_transaction.js";

const deposit_router = express.Router();

deposit_router.post("/user_gamepass_deposit", auth(), async (req, res) =>
{
    try
    {
        if (!validate_body(res, req, { robux_amount: joi.number().required()})) return;

        const user = await User.findById(req.user._id).select("_id -__v");

        if(isNaN(req.body.robux_amount)){
            res.send('Blocked');
            return;
        }

        req.body.robux_amount = parseInt(req.body.robux_amount);

        if(req.body.robux_amount < 5 ){
            res.status(400).send(`Maximum deposit: ${5}`);
            return;
        }

        deposit_list.add(user.roblox_id, req.body.robux_amount);

        res.send("success");
    }

    catch (error)
    {
        console.log(error);
        if(!res.headersSent)
            res.send("An unexpected error occured");
    }
});


export { deposit_router };