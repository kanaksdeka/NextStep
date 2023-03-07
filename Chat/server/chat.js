import http from "http";
import https from "https";
import express from "express";
import logger from "morgan";
import cors from "cors";
import socketio from "socket.io";
import redis from "redis";
import fs from 'fs';

// mongo connection
import "./config/mongo.js";
// socket configuration
import WebSockets from "./utils/WebSockets.js";
// routes
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";
import chatRoomRouter from "./routes/chatRoom.js";
import deleteRouter from "./routes/delete.js";
// middlewares
import { decode } from './middlewares/jwt.js'

const app = express();

/** Get port from environment and store in Express. */
const port = process.env.PORT || "4000";
app.set("port", port);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  //"origin": "https://trueleap.io",
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}));
app.disable('etag');

app.use("/chat/", indexRouter);
app.use("/chat/users", userRouter);
app.use("/chat/room", chatRoomRouter);
app.use("/chat/delete", deleteRouter);

/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint doesnt exist'
  })
});

/** Create HTTP server. */
const server = http.createServer(app);

  // Start server https
 /*const server = https.createServer({
    key: fs.readFileSync('../../trlp/server/certificate/trueleap.key'),
    cert: fs.readFileSync('../../trlp/server/certificate/trueleap_io.chained.crt'),
    //ca: fs.readFileSync('certificate/gd_bundle-g2-g1.crt')
  },app);*/

/** Create socket connection */
global.io = socketio.listen(server);
global.io.on('connection', WebSockets.connection)
/** Listen on provided port, on all network interfaces. */
server.listen(port);
/** Event listener for HTTP server "listening" event. */
server.on("listening", () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
});
