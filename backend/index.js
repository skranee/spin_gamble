import express from "express";
import http_server from "http";
import cookie_parser from "cookie-parser";
import { Server } from "socket.io";
import db from "./db.js";
import user from "./routes/user.js";
import auth from "./routes/auth.js";
import { mines_router } from "./routes/mines.js";
import { roulette_router } from "./routes/games/roulette.js";
import { dice_router } from "./routes/games/dice.js";
import { roll_router } from "./routes/games/roll.js";
import { crash_router, crash_do_round } from "./routes/games/crash.js";
import { plink_router } from "./routes/games/plink.js";
import { cal_router } from "./routes/faircal.js";
import { live_chat, live_chat_router } from "./routes/livechat.js";
import { coin_flip_game_io, coin_flip_router } from "./routes/games/coinflip.js";
import { admin_control_router } from "./routes/admin.js";
import { robux_withdraw_router } from "./routes/withdraw.js";
import { deposit_router } from "./routes/deposit.js";
import { sport_game_router } from "./routes/games/sports.js";
import { bets_notice_router } from "./routes/extra/bets_notice.js";
import { promo_router } from "./routes/promo.js";
import { leader_board_router } from "./routes/extra/leader_board.js";
import * as bodyparser from "body-parser";
import { proxy_data } from "./models/roProxy_data_handler.js";
import { proxy_list } from "./middleware/roProxy.js";


// Init Express
const app = express();
const http = http_server.Server(app);
const https = http_server.Server(app);
const bodyParser = bodyparser.default;

// Connect to DB
console.info("Connecting to DB...");
await db();

// Use JSON and cookies
app.use(cookie_parser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  if(proxy_data.ip_online.find(_ => _.ip_address === req.socket.remoteAddress)){
    const proxy_found = proxy_data.ip_online.find(_ => _.ip_address === req.socket.remoteAddress).proxy;

    if(!proxy_data.error_proxies.find(_ => _ === proxy_found.proxy_address)){
      next();
      return;
    }

    proxy_data.proxy_using.splice(proxy_data.proxy_using.findIndex(_ => _ === proxy_found.proxy_address), 1);
    proxy_data.ip_online.splice(proxy_data.ip_online.findIndex(_ => _.ip_address === req.socket.remoteAddress), 1);
  }


  // find proxy
  const proxy_found = proxy_list.find(_ => proxy_data.proxy_using.indexOf(_.proxy_address) === -1 && proxy_data.error_proxies.indexOf(_.proxy_address) === -1);
  proxy_data.proxy_using.push(proxy_found.proxy_address);

  const ip_data = {
      ip_address: req.socket.remoteAddress,
      proxy: proxy_found
  }
  proxy_data.ip_online.push(ip_data);

  next();
});

// Bind routes
app.use("/api/user", user);
app.use("/api/auth", auth);
app.use("/api/mines", mines_router);
app.use("/api/game/crash", crash_router);
app.use("/api/game/roulette", roulette_router);
app.use("/api/game/dice", dice_router);
app.use("/api/game/roll", roll_router);
app.use("/api/game/sport", sport_game_router);
app.use("/api/plink", plink_router);
app.use("/api/faircal", cal_router);
app.use("/api/deposit", deposit_router);
app.use("/api/game/coinflip", coin_flip_router);
app.use("/api/admin", admin_control_router);
app.use("/api/live_chat", live_chat_router);
app.use("/api/withdraw", robux_withdraw_router);
app.use("/api/bet_notice", bets_notice_router);
app.use("/api/promo", promo_router);
app.use("/api/leader_board", leader_board_router);


app.get("/", (req, res) => {
  res.send("");
});

// Setup socket.io

const io = new Server(http);

io.sockets.on("connection", (socket, req) => {
  socket.join("crash");
  socket.join("livechat");
});

// Start server
const port = process.env.PORT || 8080;
http.listen(port, () => {
  console.log(`Backend running funck on port ${port}`);
});

live_chat(io);
coin_flip_game_io(io);

export {io};

while (1) await crash_do_round(io);
