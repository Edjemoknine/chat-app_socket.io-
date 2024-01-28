const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const formatMsg = require("./formatMsg");
app.use(express.static(path.join(__dirname, "client")));

const socketIo = require("socket.io");
const server = http.createServer(app);

const io = socketIo(server);

const users = [];

io.on("connection", (socket) => {
  console.log(socket.id);
  //   Join Room
  socket.on("join", ({ name, roomId }) => {
    console.log(name, roomId);
    const user = JoinRoom(socket.id, name, roomId);
    socket.join(user.room);

    //   Welcomed new users
    socket.emit("message", formatMsg("chatBot", "Welcome to the chat"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMsg("chatBot", `${user.username} has joined the room`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Get message and then send it to the users room
  socket.on("ChatMsg", (data) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMsg("moknine", data));
  });

  //   Notify when user left
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    console.log(user);
    user &&
      io
        .to(user.room)
        .emit("message", `${user.username} has left the chat room`);

    // send new room users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
});

server.listen(3001, () => {
  console.log("serevr running on port 3001");
});

//  functions

const JoinRoom = (id, username, room) => {
  const user = { id, username, room };
  users.push(user);
  return user;
};

const getCurrentUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const userLeave = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};
