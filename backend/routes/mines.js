import auth from "../middleware/auth.js";
import express from "express";

const mines_router = express.Router();

mines_router.get("/mine", auth(), (_, res) =>
{
    let mines = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for (let i=0; i < 3; i++)
        while(true){
            let ranMine = Math.floor(Math.random()*12);
            if(mines[ranMine] != true){
                mines[ranMine] = true;
                break;
            }
        }

    res.send({MINES:mines});
});

export { mines_router };