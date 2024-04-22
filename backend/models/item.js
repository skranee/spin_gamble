import mongoose from "mongoose";

const item_schema = new mongoose.Schema
({
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

    price_in_robux:
    {
        type: Number,
        required: true
    }
});

const Item = mongoose.model("item", item_schema);

export { Item };