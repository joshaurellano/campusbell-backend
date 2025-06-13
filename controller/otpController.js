const pool  = require("../config/database");
const {sendMail} = require('./mailController')
/*This Controller contains all the functions related to OTP. From generating saving upto verifying*/
const generate_otp = async (req,res) => {
    //Variable and values declaration
    const{email,user_id,purpose_id} = req.body;
    const otp = Math.floor((Math.random() * 999999)+ 100000);
    const minute = 1000 * 600;

    console.log(Date.now())
    let expiry = (Date.now() + minute);
    const expiry_time = new Date(expiry);
    // const time_now = new Date(Date.now());
    try {
        // console.log(expiry_time.toLocaleTimeString(), time_now.toLocaleTimeString());
        const [check_if_email_exist] = await pool.query(`SELECT email from user_profile WHERE email = ?`,[email])
        console.log(email);
        if(check_if_email_exist.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Email is not associated with any account'
            })
        }
        const saveOtp = await save_otp(user_id,otp, purpose_id, expiry_time)
        console.log(saveOtp);
        // console.log(user_id);
        // console.log(purpose);
        const sendOtpEmail = await sendMail(email,otp,purpose_id)
        // console.log(sendOtpEmail);

        return res.status(200).json({
            status:'Success',
            message:'OTP generation successfull',
            otp:otp
        })
} catch (error){
    console.error(error)
}
}
const save_otp = async (user_id, otp, purpose_id, expiry_time) => {
    try{
        const [save_otp_query] = await pool.query(`INSERT INTO otp_request( user_id, otp_key, purpose_id, expiry) VALUES (?,?,?,?)`,[user_id, otp, purpose_id, expiry_time]);
        return ("Success");
    } catch (error){
        throw error
    }
}
const verify_otp = async (req,res) => {
    const {email,otp} = req.body;
    
    try{
        const [verify] = await pool.query(`SELECT u.user_id, u.email, o.otp_key,o.created_at, o.expiry, o.purpose_id,u.role_id FROM user_profile u INNER JOIN otp_request o ON u.user_id = o.user_id WHERE u.email = ? ORDER BY o.created_at DESC`,[email]);
        if(verify.affectedRows === 0) {
            return res.status(404).json({
                status:'Error',
                message:'Email not found'
            })
        }
        const otp_expiry = new Date(verify[0].expiry); 
        const dateTimeNow = new Date();
        
        console.log(otp_expiry.toLocaleTimeString());
        if(dateTimeNow > otp_expiry) {
            return res.status(403).json({
                status:'Error',
                message:'OTP expired'
            })
        } 
        if(verify[0].otp_key === otp){
            const id = verify[0].user_id;
            const[update_role] = await pool.query(`UPDATE user_profile SET role_id = '3' WHERE user_id = ?`,[id]);
            
            return res.status(200).json({
                status:'Success',
                message:'OTP is valid'
            })
        }
        else if(verify[0].otp_key !== otp){
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
module.exports = {generate_otp,verify_otp,clear_otp}
