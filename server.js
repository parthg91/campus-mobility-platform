const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => userId && socket.join(`user:${userId}`));
    socket.on("join:drivers", () => socket.join("drivers"));
    socket.on("join:passengers", () => socket.join("passengers"));
    socket.on("join:ride", (rideId) => rideId && socket.join(`ride:${rideId}`));
  });

  global.mobilityIO = io;

  httpServer.listen(port, () => {
    console.log(`Campus Mobility running at http://${hostname}:${port}`);
  });
});
