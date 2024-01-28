const message = document.getElementById("message");
const chatForm = document.getElementById("chatForm");
const messageCont = document.getElementById("messages");
const joinForm = document.getElementById("joinForm");
const username = document.getElementById("name");
const room = document.getElementById("room");
const roomName = document.getElementById("roomName");
const userList = document.getElementById("users");

const socket = io();

// Join A Room
joinForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  window.location = `http://localhost:3001/chat.html?user=${username.value}&roomId=${room.value}`;
});

const urlParams = new URLSearchParams(window.location.search);
socket.emit("join", {
  name: urlParams.get("user"),
  roomId: urlParams.get("roomId"),
});

// Send a Message
chatForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("ChatMsg", message.value);
  message.value = "";
  message.focus();
});

socket.on("message", (data) => {
  //   console.log(data);
  outputMsg(data);
  //   scroll automatically
  messageCont.scrollTop = messageCont.scrollHeight;
});

// Get room users
socket.on("roomUsers", (data) => {
  roomName.innerText = data.room;
  data.users.map((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
});

// Output message in the dom

const outputMsg = (message) => {
  const div = document.createElement("div");
  div.classList.add("messages");
  if (typeof message === "object") {
    div.innerHTML = `
    <p class="meta">${message?.name}
     <span>${message.time}</span></p>
    <p class="text">${message.text}</p>	`;
  } else {
    div.innerHTML = `
    <p class="text">${message}</p>	`;
  }

  messageCont.appendChild(div);
};
