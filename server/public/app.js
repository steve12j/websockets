const socket = io("ws://localhost:3500");

const nameInput = document.querySelector("#name");
const roomInput = document.querySelector("#room");
const msgInput = document.querySelector("#message");
const activity  = document.querySelector(".activity");
const roomList  = document.querySelector(".room-list");
const userList  = document.querySelector(".user-list");
const chatDisplay  = document.querySelector(".chat-display");

function sendMessage(e) {
    e.preventDefault();
    if(msgInput?.value && nameInput?.value && roomInput?.value){
        socket.emit("message", {
            message: msgInput?.value,
            name: nameInput?.value,
            room: roomInput.value
        });
        msgInput.value = "";
    };
    msgInput.focus();
};

function enterRoom(e) {
    e.preventDefault();
    if(nameInput.value && roomInput.value){
        socket.emit("enterRoom", {
            name: nameInput.value,
            room: roomInput.value
        });
    };
};

document.querySelector(".msg-form")
   .addEventListener("submit", sendMessage)

document.querySelector(".join-form")
   .addEventListener("submit", enterRoom)

msgInput 
    .addEventListener("keypress", () => {
       socket.emit("activity", nameInput.value);
    });

socket.on("message", (data) => {
    const { name, message, time} = data;
    if(!message) return;
    const post = document.createElement("div");
    post.className = "post";
    if(name === nameInput.value) post.className = "post post--right";
    if(name !== nameInput.value && name !== "Admin") post.className = "post post--left";

    if(name !== "Admin") {
        post.innerHTML = `
        <div class="post__header
         ${name === nameInput.value ?
             "post__header--right" : 
             "post__header--left"}"
        div>
          <span>${name}</span>
          <span>${time}</span>
        </div>
        <div class="post post__text" >${message}</div>
        `;
    } else {
        post.innerHTML = `<div class="post__text" >${message}<div>`;
    };

    chatDisplay.appendChild(post);
    chatDisplay.scrollTo = chatDisplay.scrollHeight;
});

socket.on("userList", ({ users }) => {
    showUsers(users);
});

socket.on("roomList", ({ rooms }) => {
    showRooms(rooms);
});

let activityTimeout;
socket.on("activity", name => {
    activity.textContent = `User ${name} is typing...`;
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        activity.textContent = "";
    }, 2000)
});

function showUsers(users) {
    userList.textContent = "";
    if(users){
        userList.textContent = `Members in ${roomInput.value}:`;
        users.forEach((user, i) => {
            userList.textContent += ` ${user.name}`;
            if(users.length > 1 && i !== users.length - 1) {
                userList.textContent += ",";
            }
        });
    };
};

function showRooms(rooms) {
    roomList.textContent = "";
    if(rooms){
        roomList.textContent = `Active rooms:`;
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`;
            if(rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ",";
            }
        });
    };
};