import auth from "../../middleware/auth.js";
import { User } from "../../models/user.js";
import express, { Router } from "express";
import { validate_body } from "../../common.js";
import joi from "joi";

const plink_router = express.Router();

plink_router.post("/cal", auth(),  async (req, res) =>
{
    try
    {
        // TODO: process bets :)
        // if (!validate_body(res, req, { zero: joi.number().min(1).required(), one: joi.number().min(1).required(), two: joi.number().min(1).required() })) return;
        
        // Chose chip
        
        console.log(req.key);
        res.send("");
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

export { plink_router };