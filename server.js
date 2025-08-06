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
    
	socket.on('message',async (chat_details) => {
		try {
					const {sender_id, receiver_id, message, type} = JSON.parse(chat_details)
		
					let data = JSON.parse(chat_details);
		
					switch (data.type){
						case('get_message'):
						const chat_history = await getChat(sender_id, receiver_id)
						io.emit(JSON.stringify({type: 'CHAT_HISTORY',chat_history}))
						break;
		
						case('send_message'):
						await saveChat(receiver_id, sender_id, message)
						io.emit(JSON.stringify({ status: 'ok' }));
		
						io.emit(JSON.stringify({sender_id, receiver_id, message}))
		
						break;
		
						default:
						io.emit(JSON.stringify({ type: 'ERROR', message: 'Unknown action type' }));
					}
				} catch (error){
					throw (error)
				}
	})
	
	socket.on('disconnect', () => {
        console.log('A user disconnect');
    })   
});
