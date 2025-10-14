const socket = new WebSocket("ws://localhost:3000");

const sendMessage = (e) => {
    e.preventDefault();
    console.log(e);
    const input = document.querySelector("input");
    if(input.value){
       if (socket.readyState === WebSocket.OPEN) {
          socket.send(input.value);
         } else {
          console.warn("WebSocket is not open. Message not sent.");
       }
        input.value = "";
    }
    input.focus();
}

const form  = document.querySelector("form");
form.addEventListener("submit", sendMessage)

socket.addEventListener("message", ({data}) => {
    const ul = document.querySelector("ul");
    const li = document.createElement("li");
    li.textContent = data;
    ul.appendChild(li);
})