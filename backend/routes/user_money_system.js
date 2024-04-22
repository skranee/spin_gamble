import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import express, { Router } from "express";
import { validate_body } from "../common.js";
import joi from "joi";
import Coinpayments from 'coinpayments';
import mongoose from "mongoose";
import { io } from "../index.js";

const user_money_schema = new mongoose.Schema
({
    roblox_id:
    {
        type: Number,
        required: true
    },
    robux_balance:
    {
      type: Number
    },
    ETHaddress:
    {
      type: String
    },
    LTCaddress:
    {
      type: String
    },
    BTCaddress:
    {
      type: String
    }
});


const user_money_data = mongoose.model("user_money_data", user_money_schema);

User.find((err, data) => {
    console.log(data);
}) 

const blance_notice = async (roblox_id, user_balance) => {
  try {
    if(user_balance){
      io.to("crash").emit("user_balance_notice", user_balance); 
      return;
    }
    
    const user_money = await user_money_data.findOne({roblox_id: roblox_id})
    io.to("crash").emit("user_balance_notice", user_money); 
  }catch{}
}

export { user_money_data, blance_notice };