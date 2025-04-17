const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');

const http = require('http');
const {WebSocket} = require ('ws');

const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const replyRoutes = require('./routes/replyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const imgUploadRoutes = require('./routes/imgUploadRoutes');
const test_imageRoute = require('./routes/test_imageRoute');

const {clear_otp} = require('./controller/otpController');

app = express();
const server = http.createServer(app);

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
app.use('/upload',imgUploadRoutes);
app.use('/test',test_imageRoute);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws,req) => {
    console.log('New client connected');
    var id = req.headers['sec-websocket-key']
    console.log(id)
    ws.send ('Connected!');

    //Listening message from client
    ws.on('message',(message) => {
    console.log(`Message Received:`, message);

    ws.send(`sender:${id}
        message: ${message}`);
})

wss.clients.forEach((client) => {
    client.send('Broadcast message!');
  });

    ws.on('error', (err) => {
        console.log('Error: ',err);
    })
    ws.on('close', () =>{
    console.log('Client Disconnected')
    });
});


console.log('WebSocket Server running on Port 80');
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