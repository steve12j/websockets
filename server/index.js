const ws = require("ws");
const server = new ws.Server({port: '3000'});

server.on("connection", socket => {
    socket.on("message", message => {
        console.log(new Buffer.from(message).toString(), "Message");
        socket.send(`${message}`);
    });
});

