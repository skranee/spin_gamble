import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import express, { Router } from "express";
import { validate_body } from "../common.js";
import joi from "joi";

const cal_router = express.Router();

import crypto from "crypto";

const hashString = (string) =>
  crypto.createHash('sha256').update(string).digest('hex');

const generateDiceTicket = (serverSeed, publicSeed, nonce) => {
  const hash = hashString(`${serverSeed}:${publicSeed}:${nonce}`);
  return hash
};

let SERVER_SEED = hashString(`${new Date().getTime()}`);
let CLIENT_SEED = 'my client seed';
let NONCE = 1;

cal_router.post("/cal", auth(),  async (req, res) =>
{
    try
    {
        let data =  req.body;
        if(data.todo == "createServerSeed"){
            SERVER_SEED = hashString(`${new Date().getTime()}`);
            res.send({redisPort:6379, serverSeedHash:hashString(`${SERVER_SEED}`), 
            serverSeedNoHash:SERVER_SEED});
        }
        if(data.todo == "FairCal"){
            SERVER_SEED = data.serverseed;
            CLIENT_SEED = data.clientseed;
            NONCE = 1;

            let result = generateDiceTicket(SERVER_SEED, CLIENT_SEED, NONCE);
            let SERVER_SEED_NEW = hashString(`${new Date().getTime()}`);
            res.send({result:result, oldserverseed:SERVER_SEED, serverSeedHash:hashString(`${SERVER_SEED_NEW}`)
            , serverSeedNoHash:SERVER_SEED_NEW});
            SERVER_SEED = SERVER_SEED_NEW;
        }
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

function createServerSeed(req, f){
    SERVER_SEED = hashString(`${new Date().getTime()}`);
    f(SERVER_SEED);
}

function FairCal(req, f){
    let data = req;

    SERVER_SEED = data.serverseed;
    CLIENT_SEED = data.clientseed;
    NONCE = 1;

    let result = generateDiceTicket(SERVER_SEED, CLIENT_SEED, NONCE);
    let SERVER_SEED_NEW = hashString(`${new Date().getTime()}`);
    f(result, SERVER_SEED_NEW, hashString(`${SERVER_SEED_NEW}`));

}

export { cal_router, createServerSeed, FairCal, hashString,  generateDiceTicket };