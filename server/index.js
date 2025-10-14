import { createServer } from "http";
import { Server } from "socket.io";

const httpServer =  createServer();

const io = new Server(httpServer, {
    cors : {
        orgin : process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5550"]
    }
})

io.on("connection", socket => {
    console.log(`User ${socket.id} socked connected`)
    socket.on("message", data => {
        io.emit("message",`${socket.id.substring(0,5)}: ${data}`);
    });
});

httpServer.listen(3500, () => console.log("listening to port 3500"));

