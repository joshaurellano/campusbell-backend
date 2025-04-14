/* This Controller handles functions related to emails */
/* Add verification link main */
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const pool = require('../config/database');

const sendMail = async (req,res) => {
const {email} = req.body;
    try {
        //check for email input and otp key availability
        const [check_if_email_otp_exist] = await pool.query(`SELECT otp.otp_id AS id,
        otp.otp_key AS otp,
        op.description AS purpose,
        otp.expiry AS otpExpiry,
        otp.created_at otp_date_created,
        otp.user_id,
        up.email,
        up.username,
        up.first_name AS firstName,
        up.middle_name AS middleName,
        up.last_name AS lastName
        FROM otp_request otp INNER JOIN user_profile up ON otp.user_id = up.user_id
        INNER JOIN otp_purpose op ON otp.purpose_id = op.purpose_id
        WHERE up.email = ? ORDER BY otp.otp_id DESC`,[email])
        
        if(check_if_email_otp_exist.length === 0){
            console.log(check_if_email_otp_exist[0])
            // console.log(check_if_email_otp_exist[0].email)
            // console.log(check_if_email_otp_exist[0].otp)
            return res.status(404).json({
                status:'Error',
                message:'No OTP found'
            })
        }
        // console.log(check_if_email_otp_exist[0].otp)
        const otpKey = check_if_email_otp_exist[0].otp;
        const firstName = check_if_email_otp_exist[0].firstName;
        const purpose = check_if_email_otp_exist[0].purpose;
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
    
        //Email Format
        /* Need improvement.. */

        /* List of improvements needed
            - Add greeting
            - Email too generic
        */
       
        // let response = {
        //     body: {
        //         name : `${firstName}`,
        //         intro: "Your OTP Key",
        //         table : {
        //             data : [
        //                 {
        //                 message:`
        //                 Greetings from Campus Bell, <br/><br/>

        //                 We received an OTP request for ${purpose}.<br/><br/>
                        
        //                 Here is your otp code ${otpKey}. Please note that it is valid for 10 minutes only.
                        
        //                 If you did not request for this change, please update your password and secure your account`,
        //                 }
        //             ]
        //         },
        //         // outro: "End of message"
        //     }
        // }
        let response = null;
        if(purpose === 2) {
            response = {
                body: {
                    name : `${firstName}`,
                    intro: "Your OTP Key",
                    table : {
                        data : [
                            {
                            message:`
                            Greetings from Campus Bell, <br/><br/>
    
                            We received an OTP request for ${purpose}.<br/><br/>
                            
                            Here is your otp code ${otpKey}. Please note that it is valid for 10 minutes only.
                            
                            If you did not request for this change, please update your password and secure your account`,
                            }
                        ]
                    },
                    // outro: "End of message"
                }
            }
        }
        else if(purpose === 3) {
            response = {
                body: {
                    name : `${firstName}`,
                    intro: "Your OTP Key",
                    table : {
                        data : [
                            {
                            message:`
                            Greetings, <br/><br/>
    
                            Welcome to Campus Bell, a forum made by student for all students.</br>
                            Before proceeding, get your OTP here so you can start interacting with otehr students </br> 
                            >>> ${otp}. </br></br>

                            Feel free to ask questions to the community. We are all here to help one another. </br> </br>

                            Should you have any trouble don't hesitate to request guide from admins. <br/>

                            Enjoy your stay!.

                            `,
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
                    name : `${firstName}`,
                    intro: "Your OTP Key",
                    table : {
                        data : [
                            {
                            message:`
                            Greetings from Campus Bell, <br/><br/>
    
                            We received an OTP request for ${purpose}.<br/><br/>
                            
                            Here is your otp code ${otpKey}. Please note that it is valid for 10 minutes only.
                            
                            If you did not request for this change, please update your password and secure your account`,
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
            subject: "OTP code",
            html: mail
        }
        // transporter.sendMail(message).then(() =>{
        //     console.log("Mail sent successfully")
        //     })
        transporter.sendMail(message);
        // res.send({
        //     status:'Success',
        //     message:'Mail sent successfully'
        // })
        res.send(response);
    } catch(error){
        console.error(error);
        throw error
    }
}
module.exports = {
    sendMail
}