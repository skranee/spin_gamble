import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import joi from "joi";

// Define the structure of a user
const user_schema = new mongoose.Schema
({
    roblox_key:
    {
        type: String,
        required: true
    },

    roblox_id:
    {
        type: Number,
        required: true
    },

    roblox_name:
    {
        type: String,
        required: true
    },

    withdraw_gamepass_product_id:
    {
        type: Number
    },

    withdraw_gamepass_id:
    {
        type: Number
    },

    proxy_address:{
        type: String
    }, 

    avatar_url:
    {
        type: String
    },

    block_withraw:
    {
        type: Boolean,
        default: false
    }
});

user_schema.methods.generateAuthToken = function()
{
    // Generate auth token with the user id as the payload
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    });
};

const User = await mongoose.model("user", user_schema);

const validate_login = (user) =>
{
    // Validate data provided
    const schema = joi.object
    ({
        roblox_key: joi.string().required()
    });

    return schema.validate(user);
}

export { User, validate_login };