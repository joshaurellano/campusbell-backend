/* This Controller handles functions related to emails */
/* Add verification link main */
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const pool = require('../config/database');

const sendMail = async (email,otp,purpose_id,username) => {

    try {
        const domain = process.env.DOMAIN
        const purpose = purpose_id;
        let config = {
            service : 'gmail',
            auth : {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        let transporter = nodemailer.createTransport(config);
        
        let MailGenerator = new Mailgen({
            theme : "default",
            product : {
                name : "Campus Bell",
                link : 'https://mailgen.js/'
            }
        })
       
        let response = null;
        if(purpose === '2') {
            subject = 'Password Reset Request'
            response = {
                body: {
                    name : `${username}`,
                    intro: "Password Change Request",
                    table : {
                        data : [
                            {
                            message:`
                            Greetings from Campus Bell, <br/><br/>
                                
                            We received a request to change your password. Please click on this link to continue <a href="${domain}${otp}">Link</a>.
                            <br /><br />
                            You can also copy and paste it into your browser ${domain}${otp}<br /><br />
                            Please note that it is valid for 10 minutes only.
                            
                            If you did not request for this change, please update your password and secure your account`,
                            }
                        ]
                    },
                    // outro: "End of message"
                }
            }
        }
        else if(purpose === '3') {
           subject = 'Account Verification'
            response = {
                body: {
                    name : `${username}`,
                    intro: "Your OTP Key",
                    table : {
                        data : [
                            {
                            message:`
                            <p style="color:#74787e">
                            Greetings, <br/><br/>
                            
                            Welcome to Campus Bell, a forum made by student for all students.</br>
                            Before proceeding, get your OTP here so you can start interacting with other students</p> </br> 
                            <p style="text-align:center; font-weight:bold;font-size:24px;color:black"> ${otp} </p>
                            
                            <p style="color:#74787e">
                            Login with your username and password and after that, you will be redirected to a form to verify your account. Enter your email and the otp to continue. </br></br>

                            Feel free to ask questions to the community. We are all here to help one another. </br> </br>

                            Should you have any trouble don't hesitate to request guide from admins. <br/>

                            Enjoy your stay!.</p>`,
                            }
                        ]
                    },
                    // outro: "End of message"
                }
            }
        }
        else {
            response = {
                body: {
                    name : `${username}`,
                    intro: "Your OTP Key",
                    table : {
                        data : [
                            {
                            message:`
                            Greetings from Campus Bell, <br/><br/>
                                
                            Here is your otp code. Please note that it is valid for 10 minutes only.
                            
                            If you did not request for this change, you can safely ignore this message.`,
                            }
                        ]
                    },
                    // outro: "End of message"
                }
            }
        }
        
        let mail = MailGenerator.generate(response)

        let message = {
            from : process.env.EMAIL,
            to : email,
            subject,
            html: mail
        }
 
        await transporter.sendMail(message);
   
    } catch(error){
        console.error(error);
        throw error
    }
}
module.exports = { sendMail }