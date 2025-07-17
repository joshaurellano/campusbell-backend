const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');
const otpRoutes = require('./routes/otpRoutes');
const userRoutes = require('./routes/userRoutes');
const topicRoutes = require('./routes/topicRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const replyRoutes = require('./routes/replyRoutes');
const reportRoutes = require('./routes/reportRoutes');
const imgUploadRoutes = require('./routes/imgUploadRoutes');
const reactsRoutes = require('./routes/reactsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const freedomwallRoutes = require('./routes/freedomwallRoutes');
const searchRoutes = require('./routes/searchRoutes');

const {clear_otp} = require('./controller/otpController');

const corsOptions = {
	origin: (origin, callback) => {
	  // Allow all origins or validate here
	  if (origin) {
		callback(null, origin); // Allow the current origin
	  } else {
		callback(null, '*'); // Allow non-browser requests (e.g., Postman)
	  }
	},
	credentials: true, // Allow credentials
  allowedHeaders : ['Content-Type', 'X-Client-Type','Authorization']
  };
app = express();

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(cookieParser())

app.get('/',function(req,res){
    res.send("Accessing System Backend");
});

app.use('/auth',authRoutes);
app.use('/send',mailRoutes);
app.use('/otp',otpRoutes);
app.use('/user',userRoutes);
app.use('/topic',topicRoutes);
app.use('/post',postRoutes);
app.use('/comment',commentRoutes);
app.use('/reply',replyRoutes);
app.use('/report',reportRoutes);
app.use('/upload',imgUploadRoutes);
app.use('/react',reactsRoutes);
app.use('/alert',notificationRoutes);
app.use('/freedomwall',freedomwallRoutes);
app.use('/search',searchRoutes);


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

module.exports = app;