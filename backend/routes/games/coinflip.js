import express, { response } from "express";
import { User } from '../../models/user.js';
import auth from "../../middleware/auth.js";
import axios from "axios";
import noblox from  "noblox.js"
import { hashString, generateDiceTicket} from "../faircal.js";

const coin_flip_router = express.Router();

let io;

let imgSize = "75x75";

let smallRAP = 1300;

function coin_flip_game_io(IO) 
{
    io = IO;
    io.sockets.on("connection", (socket) =>
    {
        socket.on('coinflip', async function(reqdata){
            let user = await User.findOne({ roblox_key: reqdata.roblox_key })
        });
    })
}

async function trading_system(data){

    // send trade
    await noblox.setCookie(data.buyer.roblox_key);
    await noblox.sendTrade(data.seller.roblox_id, { userAssetIds: data.sellerAssetIds }, { userAssetIds: data.buyerAssetIds }).then(response => {
        console.log(response);
    }).catch(error => {
        console.log(error);
    })

}

coin_flip_router.post("/getItems", auth(),  async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user._id).select("_id -__v");
        let user_collectibles = await noblox.getCollectibles({userId: user.roblox_id, sortOrder: "Asc", limit: 100});
        let user_collectibles_ids = user_collectibles.map(_ => _.assetId)

        await axios.get(`https://thumbnails.roblox.com/v1/assets?assetIds=${user_collectibles_ids.join(",")}&size=${imgSize}&format=Png&isCircular=true`).then(response => {
            user_collectibles = user_collectibles.map(_ => {
                _.imageUrl = response.data.data.find(__ => __.targetId === _.assetId).imageUrl;
                _.status = "QUALIFIED";
                if(_.recentAveragePrice <= smallRAP)
                    _.status = "SMALL";
                return _;
            })
        }).catch (error => {
            res.send("An unexpected error occured");
        })

        res.send(user_collectibles);
        
    }

    catch (error)
    {
        console.log(error);
        res.send("An unexpected error occured");
    }
});

coin_flip_router.post("/create_game", auth(),  async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user._id).select("_id -__v");

        if(req.body.flipSide != "up" && req.body.flipSide != "down"){
            res.send("blocked");
            return;
        }

        if(!req.body.items){
            res.send("blocked");
            return;
        }

        let user_collectibles = await noblox.getCollectibles({userId: user.roblox_id, sortOrder: "Asc", limit: 100});

        let user_collectibles_ids = user_collectibles.map(_ => {
            if(_.recentAveragePrice >= smallRAP)
                return _.assetId
        })

        if(!req.user.is_premium || user_collectibles[0].recentAveragePrice >= smallRAP){
            res.send(`you must be premium and have one item's RAP below ${smallRAP}`);
            return;
        }

        if(req.body.items.find(_=>{if(!user_collectibles_ids.find(__=>_===__))return _})){
            res.send(`one of your bet items RAP below ${smallRAP}`);
            return;
        }

        let game_room = {
            game_room_id: new Date().getTime(),
            gameData: {
                player1:{
                    roblox_id: user.roblox_id,
                    roblox_name: user.roblox_name,
                    betItems: req.body.items,
                    flip: req.body.flipSide
                },
                player2: {
                    roblox_id: null,
                    roblox_name: null,
                    betItems: null,
                    flip: null
                },
                game_seed: hashString(`${new Date().getTime()}`),
                game_started: false
            },
        }

        await fix_botAccounts_status();
        let bot_account = botAccounts.find({can_trade: true, is_premium: true, roblox_key: {$ne: "out-dated!!!"}});
        
        //await noblox.setCookie(user.roblox_key);
        await noblox.sendTrade(user.roblox_id, { userAssetIds: req.body.items }, { userAssetIds: (await noblox.getCollectibles({userId: bot_account.roblox_id, sortOrder: "Asc", limit: 10}))[0].assetId}, {jar: {session: user.roblox_key}})
        .catch(error => {
            console.log(error);
        })
        res.send(user_collectibles_ids);
    }

    catch (error)
    {
        console.log(error);
        res.send("An unexpected error occured");
    }
});
export { coin_flip_router, coin_flip_game_io};