const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const socketHandler = require('./socketHandlers');

require("dotenv").config();
const { PORT } = process.env;
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

connectDB();

const userRoute = require("./routes/userRoutes.js");
const convRoute = require("./routes/convRoutes.js");
// const fileRoute = require("./routes/fileRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/conversation", convRoute);
// app.use("/api/files", fileRoute);
socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
