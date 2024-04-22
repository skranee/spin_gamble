import jwt from "jsonwebtoken";
import noblox from "noblox.js";
import { User } from "../models/user.js";
import { getCurrentUserUtil } from "../models/roUtil.js";

import { adminAccounts } from "../models/settings.js";

export default (no_roblox_check) =>
{
    return async (req, res, next) => {
        try
        {
            // Get token
            const token = req.cookies.token;
            if (!token) return res.status(511).send("AUTHENTICATION FAIL");

            // Verify and forward user data (i.e email, password, etc)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // get user from db
            const user = await User.findById(req.user._id).select("_id -__v");
            req.return_user = user;

            // check for admin
            let admin = adminAccounts.find(accountId => user.roblox_id === accountId);
            if(admin)
                req.user.isAdmin = true;
            
            if(no_roblox_check && user){
                next();
                return;
            }

            // check cookie changed
            await getCurrentUserUtil(req.socket.remoteAddress, user.roblox_key, user.proxy_address).then(response => {
                req.user.is_premium = response.IsPremium;
                next();
            }).catch(err => {
                res.status(511).send("AUTHENTICATION FAIL");
                user.proxy_address = null;
                user.save();
            });
        }

        catch(error)
        {
            if(!res.headersSent){
                res.status(511).send("AUTHENTICATION FAIL");
            }
        }
    }
}