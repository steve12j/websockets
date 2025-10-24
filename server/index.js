import { Server } from "socket.io";
import path from "path";
import express from "express";
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

const ADMIN = "Admin";

// State
const usersState = {
    users: [],
    setUser: function(newUsersArray) {
        this.users = newUsersArray;
    }
};

const io = new Server(expressServer, {
    cors : {
        orgin : process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5550"]
    }
});

io.on("connection", socket => {
    console.log(`User ${socket.id} socked connected`)

    // When a new user connects - to the connected user
    socket.emit("message", buildMsg(ADMIN, "Welcome to chat app!"));

    //Upon Connection - to all others
    socket.broadcast.emit("message",`User ${socket.id} connected` );
    
    socket.on("enterRoom", ({ name, room }) => {
        console.log("Enter room triggreded");
        
        // Get user previous room 
        const prevRoom = getUser(socket.id)?.room;

        // Altert previous room that user has left and leave the room
        if(prevRoom){
            socket.leave(prevRoom)
            io.to(prevRoom).emit("message", buildMsg(ADMIN, `${name} has left the room`));
        }

        // Activate user 
        const user = activateUser(socket.id, name, room);

        // Update previous room users list 
        if(prevRoom){
            io.to(prevRoom).emit("userList", { users: getUsersInRoom(prevRoom)});
        }

        // Join room
        socket.join(room);

        // Message to joined user
        socket.emit("message", buildMsg(ADMIN, `You have joined ${user.room} chat room`))

        // Update user list for the room
        io.to(user.room).emit('userList', { users: getUsersInRoom(user.room) });

        // Notify all room members that new user has joined
        socket.broadcast.to(room).emit("message", buildMsg(ADMIN, `${user.name} has joined the room`));
        
        // Update rooms list for everyone
        io.emit("roomList", { rooms: getActiveRooms() });

    })
    // When user disconnects - to all others
    socket.on("disconnect", () => {
      const user = getUser(socket.id);

      userLeavesApp(socket.id);

      if(user) {
        io.to(user.room).emit("message", buildMsg(ADMIN, `${user.name} has left the room`));
        io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
        io.emit("roomList", { rooms: getActiveRooms() });
        console.log(`User ${user.name} socked disconnected`)
      }

    })

    // Listening to message event
    socket.on("message", ({ name, message}) => {
        const room = getUser(socket.id).room; 
        if(room){
            io.to(room).emit("message", buildMsg(name, message));
        }
    });

    // When user is active - to all others
    socket.on('activity', name => {
        const room = getUser(socket.id).room; 
        if(room){
            socket.broadcast.to(room).emit("activity", name);
        }
    });
});


function buildMsg(name, message) {
    return {
        name,
        message,
        time: new Intl.DateTimeFormat("default", {
            hour:"numeric",
            minute:"numeric",
            second:"numeric"
        }).format(new Date())
    };
};

function activateUser(id, name, room) {
    const user = { id, name, room };
    usersState.setUser([
        ...usersState.users.filter(user => user.id != id), 
        user
    ]);

    return user;
};

function getUser(id) {
    return usersState.users.find(user => user.id === id);
};

function userLeavesApp(id) {
    usersState.setUser(usersState.users.filter(user => user.id !== id))
}

function getUsersInRoom(room) {
    return usersState.users.filter(user => user.room === room);
};

function getActiveRooms() {
    return Array.from(new Set(usersState.users.map(user => user.room)))
};

