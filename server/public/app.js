const socket = io("ws://localhost:3500");
const activity  = document.querySelector(".activity")
const msgInput = document.querySelector("input");

const sendMessage = (e) => {
    e.preventDefault();
    if(msgInput.value){
        socket.emit("message",msgInput.value);
        msgInput.value = "";
    }
    msgInput.focus();
};

const form  = document.querySelector("form");
form.addEventListener("submit", sendMessage)

socket.on("message", (data) => {
    const li = document.createElement("li");
    li.textContent = data;
    document.querySelector("ul").appendChild(li);
});

msgInput.addEventListener("keypress", () => {
    socket.emit("activity", socket.id.substring(0,5));
});

let activityTimeout;
socket.on("activity", name => {
    activity.textContent = `User ${name} is typing...`;
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
        activity.textContent = "";
    }, 2000)
});