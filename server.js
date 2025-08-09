const app = require ('./app');

const http = require('http');
const { saveChat, getChat } = require('./controller/chatController');

const server = http.createServer(app);

const { Server } = require("socket.io");
const { type } = require('os');
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
    
	socket.on('join', async (room_id) => {
		socket.join(room_id.room_id);
		socket.room_id = room_id.room_id;
		socket.emit('user joined room', room_id.room_id);
		const chat_history = await getChat(socket.room_id);
		socket.emit("history",chat_history);
	})

	socket.on('message', async (chat_details) => {
		const {receiver_id, sender_id, message} = chat_details
		await saveChat(socket.room_id, receiver_id, sender_id, message)
		// const created_at = new Date(Date.now());
		// const newChat = {...chat_details, created_at}
		const chat_history = await getChat(socket.room_id);
		socket.emit("history",chat_history);
		io.to(socket.room_id).emit("message",newChat)
	})
	
	socket.on('disconnect', () => {
        console.log('A user disconnect');
    })
	
	socket.on('error', (error) => {
		console.error('Socket error:', error);
	})
});
