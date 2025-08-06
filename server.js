const app = require ('./app');

const http = require('http');
const { saveChat, getChat } = require('./controller/chatController');

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors : {
	origin: (origin, callback) => {
	  // Allow all origins or validate here
	  if (origin) {
		callback(null, origin); // Allow the current origin
	  } else {
		callback(null, '*'); // Allow non-browser requests (e.g., Postman)
	  }
	},
	credentials: true, // Allow credentials
  }
})
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected`);
    
	socket.on('join', (room_id) => {
		socket.join(room_id);
		socket.room_id = room_id;
		socket.emit('user joined', room_id);
	})

	socket.on('message',(chat_details) => {
		socket.to(socket.room_id).emit("message:",chat_details)
	})
	
	socket.on('disconnect', () => {
        console.log('A user disconnect');
    })
	
	socket.on('error', (error) => {
		console.error('Socket error:', error);
	})
});
