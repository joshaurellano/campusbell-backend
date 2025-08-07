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
    
	socket.on('join', (room_id) => {
		socket.join(room_id);
		socket.room_id = room_id;
		socket.emit('user joined', room_id);
	})

	socket.on('message',(chat_details) => {
		const {receiver_id, sender_id, message} = chat_details

		console.log('ReceiverID', receiver_id, 'SenderID',sender_id, 'Message',message)
		socket.to(socket.room_id).emit("message:",{
			receiver_id, 
			sender_id, 
			message
		})
	})
	
	socket.on('disconnect', () => {
        console.log('A user disconnect');
    })
	
	socket.on('error', (error) => {
		console.error('Socket error:', error);
	})
});
