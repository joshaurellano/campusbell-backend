const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const WebSocket = require('ws');

const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const replyRoutes = require('./routes/replyRoutes');
const reportRoutes = require('./routes/reportRoutes');

const {clear_otp} = require('./controller/otpController');

const wss = new WebSocket.Server({ port: 8080 });

app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/',function(req,res){
    res.send("Accessing System Backend");
});

app.use('/auth',authRoutes);
app.use('/send',mailRoutes);
app.use('/otp',otpRoutes);
app.use('/user',userRoutes);
app.use('/post',postRoutes);
app.use('/comment',commentRoutes);
app.use('/reply',replyRoutes);
app.use('/report',reportRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.send ('Connected!');

    //Listening message from client
    ws.on('message',(message) => {
    console.log(`Message Received: ${message}`);

    ws.send(`Received: ${message}`);
})

    ws.on('close', () =>{
    console.log('Client Disconnected')
    });
});

console.log('WebSoket Server running on ws://localhost:8080');
cron.schedule ('* * * * Sunday', async () =>{
    try{
        console.log("cron job working");
        // clear_otp();
        const expired_otp_clear = await clear_otp(); 
        console.log(expired_otp_clear);
    } catch (error){
        throw(error);
    }
})