const pool  = require("../config/database");
const {sendMail} = require('./mailController')
const {hashing, decrypt} = require('../middleware/encryption');
/*This Controller contains all the functions related to OTP. From generating saving up to verifying*/
const generate_otp = async (req,res) => {
    //Variable and values declaration
    const{email,purpose_id} = req.body;
    const otpKey = Math.floor(100000 + Math.random() * 900000);
    const otp = String(otpKey)
    const minute = 1000 * 600;

    let expiry = (Date.now() + minute);
    const expiry_time = new Date(expiry);
    
    try {
        const hashEmail = await hashing(email);
        const [check_if_email_exist] = await pool.query(`SELECT hashed_email, user_id, username from user_profile WHERE hashed_email = ?`,[hashEmail])
        if(check_if_email_exist.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Email is not associated with any account'
            })
        }
        const result = check_if_email_exist[0];
        const user_id = result.user_id
        const username = result.username

        const save_sendOtp = async () =>{
            const result = await Promise.all([
                await save_otp(user_id,otp, purpose_id, expiry_time),
                await sendMail(email,otp,purpose_id,username)
            ])
        }
        await save_sendOtp();

        return res.status(200).json({
            status:'Success',
            message:'OTP generation successfull',
        })
} catch (error){
    console.error(error)
}
}
const requestAnotherOtp = async (req, res) => {
    const{phone_number,purpose_id} = req.body;
    const otpKey = Math.floor(100000 + Math.random() * 900000);
    const otp = String(otpKey)
    const minute = 1000 * 600;

    let expiry = (Date.now() + minute);
    const expiry_time = new Date(expiry);
    
    try {
        const hashPhoneNumber = await hashing(phone_number);
        const [emailPhoneNumber] = await pool.query(`SELECT hashed_email, email, user_id, username from user_profile WHERE hashed_phoneNumber = ?`,[hashPhoneNumber])
        
        if(emailPhoneNumber.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Phone Number is not associated with any account.'
            })
        }
        const result = emailPhoneNumber[0];
        const user_id = result.user_id
        const username = result.username
        const parseEmail = JSON.parse(result.email)
        const email = decrypt(parseEmail.encryptedData, parseEmail.iv)

        const save_sendOtp = async () =>{
            const result = await Promise.all([
                await save_otp(user_id,otp, purpose_id, expiry_time),
                await sendMail(email,otp,purpose_id,username)
            ])
        }
        await save_sendOtp();

        return res.status(200).json({
            status:'Success',
            message:'OTP regeneratio success'
        })
    } catch (error) {
        console.error(error)
    }
}
const save_otp = async (user_id, otp, purpose_id, expiry_time) => {
    try{
        const hashOtp = await hashing(otp);
        const [save_otp_query] = await pool.query(`INSERT INTO otp_request( user_id, otp_key, purpose_id, expiry) VALUES (?,?,?,?)`,[user_id, hashOtp, purpose_id, expiry_time]);
        return ("Success");
    } catch (error){
        throw error
    }
}
const verify_otp = async (req,res) => {
    const {email,otp} = req.body;
    
    try{
        const hashOtpandEmail = async () => {
            const result = await Promise.all([
                hashing(email),
                hashing(otp)])
            return result
        }
       
        const hashResult = await hashOtpandEmail();

        const hashedEmailResult = hashResult[0]
        const hashedOtpResult = hashResult[1]

        const [verify] = await pool.query(`SELECT u.user_id, u.hashed_email AS email, o.otp_key,o.created_at, o.expiry, o.purpose_id,u.role_id FROM user_profile u INNER JOIN otp_request o ON u.user_id = o.user_id WHERE u.hashed_email = ? ORDER BY o.created_at DESC`,[hashedEmailResult]);
        if(verify.length === 0) {
            return res.status(404).json({
                status:'Error',
                message:'Email not found'
            })
        }
        const otp_expiry = new Date(verify[0].expiry); 
        const dateTimeNow = new Date();
        
        if(dateTimeNow > otp_expiry) {
            return res.status(403).json({
                status:'Error',
                message:'OTP expired'
            })
        } 
        if(verify[0].otp_key === hashedOtpResult){
            const id = verify[0].user_id;
            const[update_role] = await pool.query(`UPDATE user_profile SET role_id = '3' WHERE user_id = ?`,[id]);
            
            return res.status(200).json({
                status:'Success',
                message:'OTP is valid'
            })
        }
        else if(verify[0].otp_key !== hashedOtpResult){
            return res.status(400).json({
                status:'Error',
                message:'OTP not valid'
            })
        }

    } catch(error){
        console.log(error);
        return res.status(500).json({
            status:error,
            message:'There was an error processing your request'
        })
    }
}
const clear_otp = async () => {
    
    try {
        const[time_zone_update] = await pool.query(`SET time_zone = '+08:00'`);
        console.log('Time Zone set')
        const [clearing] = await pool.query(`DELETE FROM otp_request WHERE CURRENT_TIMESTAMP > expiry`);

        if(clearing.affectedRows === 0){
            return "No OTP cleared";
        }
        else {
            return "OTP Cleared";
        }
    } catch (error) {
        throw (error);
    }
}
module.exports = {generate_otp,verify_otp,clear_otp,requestAnotherOtp}
