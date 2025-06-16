const app = require ('./app');

const http = require('http');
const {WebSocket} = require ('ws');
const { saveChat, getChat } = require('./controller/chatController');

const server = http.createServer(app);

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws,req) => {
    console.log('New client connected');
    var id = req.headers['sec-websocket-key']
    console.log(id)
    ws.send ('Connected!');

    //Listening message from client
    ws.on('message',async(chat_details) => {
        try {
            const {sender_id, receiver_id, message, type} = JSON.parse(chat_details)

            let data = JSON.parse(chat_details);

            switch (data.type){
                case('get_message'):
                const chat_history = await getChat(sender_id, receiver_id)
                ws.send(JSON.stringify({type: 'CHAT_HISTORY',chat_history}))
                break;

                case('send_message'):
                await saveChat(receiver_id, sender_id, message)
                ws.send(JSON.stringify({ status: 'ok' }));

                wss.clients.forEach((client) => {
                client.send('Broadcast message!');
                client.send(JSON.stringify({sender_id, receiver_id, message}))
                });

                break;

                default:
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown action type' }));
            }
        } catch (error){
            throw (error)
        }
        
      
        
            ws.on('error', (err) => {
                console.log('Error: ',err);
            })
            ws.on('close', () =>{
            console.log('Client Disconnected')
            });  
    })
});
