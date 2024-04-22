import auth from "../middleware/auth.js";
import { User } from "../models/user.js";
import { Item } from "../models/item.js";
import express from "express";
import noblox from "noblox.js";
import axios from "axios";
import { user_money_data } from "./user_money_system.js";
import { getCurrentUserUtil } from "../models/roUtil.js";

const router = express.Router();

router.get("/status", auth(), async (req, res) =>
{
    try
    {
        // Get user
        const user = await User.findById(req.user._id).select("_id -__v");

        let info = await getCurrentUserUtil(req.socket.remoteAddress, user.roblox_key ); 
        info.roblox_key = user.roblox_key;
        let avatar_data = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.roblox_id}&size=352x352&format=Png&isCircular=true`);
        info.thumbnail_circHeadshot = avatar_data.data.data[0].imageUrl;
        user.avatar_url = avatar_data.data.data[0].imageUrl;

        await user.save();
        
        let money_info = (await user_money_data.findOne({roblox_id: user.roblox_id})).toObject();
        
        res.send({...info, ...money_info});
    }

    catch (error)
    {
        res.status(500).send("An unexpected error occured");
    }
});
    
router.get("/inventory", auth(), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user._id).select("_id -__v");
        await noblox.setCookie(user.roblox_key, false);

        const asset_types =
        [
            "Decal",                "Pants",            "TShirt",
            "Audio",                "Hat",              "Model",
            "Shirt",                "Pants",            "Decal",
            "Head",                 "Face",             "Gear",
            "Animation",            "Package",          "Plugin",
            "HairAccessory",        "FaceAccessory",    "NeckAccessory",
            "ShoulderAccessory",    "FrontAccessory",   "BackAccessory",
            "WaistAccessory"
        ];

        // Get items from Roblox
        const inventory = await noblox.getInventory(user.roblox_id, asset_types);
        let items = inventory;
        
        // Reduce to just Id's
        items = items.map(item => { return item.assetId });

        // Get all "unresolved" items
        let local_items = await Item.find
        ({
            "roblox_id": { $in: items }
        }).exec();

        // Reduce unresolved items to just ID's too
        local_items = local_items.map(item => { return item.roblox_id });

        // Filter items to only those unresolved
        const unresolved_items = items.filter(i => !local_items.includes(i));

        // For each unresolve price, fall back to Roblox API
        let promises = [];
        for (let i = 0; i < unresolved_items.length; ++i)
        {
            promises.push
            (
                axios.get("https://api.roproxy.com/marketplace/productinfo?assetId=" + unresolved_items[i])
                .then(res =>
                {
                    let db_item = new Item
                    ({
                        roblox_id: unresolved_items[i],
                        roblox_name: res.data.Name,
                        price_in_robux: res.data.PriceInRobux ? res.data.PriceInRobux : 0
                    });

                    return db_item.save();
                })
            )
        }

        await Promise.all(promises);

        // Now all items are resolved, simply return DB lookup where prices exceed zero
        const resolved_inventory = await Item.find
        ({
            "roblox_id": { $in: items },
            "price_in_robux": { $gt: 0 }
        }).exec();

        res.send(resolved_inventory.map(item =>
        {
            return {
                id: item.roblox_id,
                name: item.roblox_name,
                price: item.price_in_robux
            }
        }));
    }

    catch (error)
    {
        console.error(error);
        res.send("An unexpected error occured");
    }
});

export default router;