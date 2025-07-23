const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {sendMail} = require('./mailController');
const {encrypt, decrypt, hashing, createResetPasswordToken} = require('../middleware/encryption')

/*Add input validation using express validation. Add the function on middleware folder*/

//User registration
const register = async (req,res) => {
    const {username,password,first_name,middle_name,last_name,email,phone_number,yr_level,program,region,province,city,town,barangay,street,house_no, role_id} = req.body;
    
    const saltRounds = 10; 
/*The fields here are the fields that have NOT NULL constraints on database*/
    if(!username||!password||!email||!phone_number||!first_name||!last_name){
        return res.status(400).json({
            status:'Error',
            message:'Necessary fields missing'   
        });
     }
    try{
        const hashedPass = await bcrypt.hash(password, saltRounds);
        const data = Object.values(req.body)
        const field = Object.keys(req.body)
        

        const encryptedDetails = {};
         for (let i = 0; i<field.length; i++){
            const result = encrypt(data[i])

            encryptedDetails[field[i]] = JSON.stringify(result)
         }        
        
        const hashedEmail = hashing(req.body.email)
        const hashedPhoneNumber = hashing(req.body.phone_number)

        const [rows] = await pool.query(`INSERT INTO user_profile (
            username,
            password,
            first_name,
            middle_name,
            last_name,
            email,
            hashed_email,
            phone_number,
            hashed_phoneNumber,
            yr_level,
            program,
            region,
            province,
            city,
            town,
            barangay,
            street,
            house_no) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [   username,
                hashedPass,
                first_name,
                middle_name,
                last_name,
                encryptedDetails.email,
                hashedEmail,
                encryptedDetails.phone_number,
                hashedPhoneNumber,
                encryptedDetails.yr_level,
                encryptedDetails.program,
                encryptedDetails.region,
                encryptedDetails.province,
                encryptedDetails.city,
                encryptedDetails.town,
                encryptedDetails.barangay,
                encryptedDetails.street,
                encryptedDetails.house_no]
        );

        //Printing of user details for successful registration
        return res.status(201).json({
            status:'Success',
            message:'User registered successfully!',
            id_number: rows.insertId,
            username,
            first_name,
            middle_name,
            last_name,
            email,
            phone_number,
            role_id
        });
    }
    catch (err) {
        //Duplicate entry error handling
        /*Improve function by adding the specific duplicate field */
        if(err.code === 'ER_DUP_ENTRY'){
            // console.error(err.message)
            if(err.message.includes('email')){
            return res.status(409).json({
                status:'Error',
                message:'Email already in used'
                });
            }
            else if(err.message.includes('phoneNumber' || 'phone_number')){
            return res.status(409).json({
                status:'Error',
                message:'Phone Number already in used'
                });
            }
            else if(err.message.includes('username')){
            return res.status(409).json({
                status:'Error',
                message:'Username already in used'
                });
            }
        }
        //Other database error that is not handled here
        else{
            //console.log(err);
            return res.status(500).json({
                status:'Error',
                message:'There was an error processing the request'
            });
        }
    }
}  
const login = async (req,res) => {
    const {username, password} = req.body;
    const clientType = req.headers['x-client-type'];
    try {
        const[usernameResult] = await pool.query(`SELECT username, password,user_id,role_id FROM user_profile WHERE username = ?`, [username]);
        if(usernameResult.length === 0 ){
            return res.status(404).json({
                status:'Error',
                message:'Username not found'
            })
        }
        const user = usernameResult[0];
        const checkPasswordIfRight = await bcrypt.compare(password, user.password);

        if(!checkPasswordIfRight){
            return res.status(400).json({
                status:'Error',
                message:'Wrong Password'
            });
        }
        if(user.role_id === 4) {
            return res.status(401).json({
                status:'Error',
                message:'Unverified'
            })
        }

        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
            role_id: user.role_id,
            
        }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME });
        
        res.cookie('token',token,{
            httpOnly: true,
            secure: true,
            //secure:false,
            //sameSite:'Strict'
            sameSite:'None',
            maxAge: 3600000
        });
        if(clientType === 'mobile'){
        
        return res.status(200).json({
            message:'Login successful',
            token: token});
        }

        return res.status(200).json({
            status:'Success',
            message:'Login successful'});

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            status:'Error',
            message:'There was an error processing your request for login'
        })
    }

}

const logout = async (req,res) => {
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:true,
            sameSite:'None'
        })
        res.json({
            status:'Success',
            message:'Logout successful'
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            stattus:'Error',
            message:'There was an error logging out'
        })
    }
}

const userTokenInfo = async (req, res) => {
    try{
        const token = req.cookies.token;
        // console.log(token)
        const decoded_token = jwt.verify(token,process.env.JWT_SECRET);
        res.json({
            status:'Success',
            result:decoded_token
        })

    } catch(error){
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error getting reading token'
        })
    }
}
const requestPasswordReset = async (req,res) => {
    const {email} = req.body;
    
    const hashedEmail = await hashing (email)
    try {
        const [findEmail] = await pool.query(`SELECT user_id, username, hashed_email FROM user_profile WHERE hashed_email = ?`,[hashedEmail])
        if(findEmail.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'The email is not associated with any account'
            })
        }
        const passwordResetToken = await createResetPasswordToken()
        const expiry = new Date(Date.now() + 10 * 60 * 1000)
        const otp = passwordResetToken;
        const purpose_id = '2'
        const hashedToken = await hashing(passwordResetToken);

        async function saveToken_sendEmail (){
        const results = await Promise.all([
            pool.query(`INSERT INTO password_reset_token (user_id, token, expiry) VALUES (?,?,?)`,[findEmail[0].user_id, hashedToken, expiry]),
            sendMail(email, otp, purpose_id, findEmail[0].username)
        ])
    }

    await saveToken_sendEmail();

        return res.status(200).json({
            status:'Success',
            message:'Token generated and saved'
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status:'Error',
            message:'There was an error generating token'
        })
    }
}
const verifyPasswordResetToken = async (req,res) => {
    const{token} = req.params;

    try {
        const hashToken = await hashing(token)
        const [checkToken] = await pool.query(`SELECT user_id, token, expiry FROM password_reset_token WHERE token = ?`,[hashToken])
        if(checkToken.length === 0){
            return res.status(404).json({
                status:'Error',
                message:'Token not found'
            })
        }
        const resetToken = checkToken[0]
        const dateTimeNow = new Date(Date.now())
        const tokenExpiry = new Date(resetToken.expiry);

        if(dateTimeNow > tokenExpiry){
            return res.status(410).json({
                status:'Error',
                message:'Token expired',
            })
        }
        return res.status(200).json({
            status:'Success',
            mesage:'Link verified',
            result: checkToken[0]
        })
    } catch (error) {
        return res.status(500).json({
            status:'Error',
            message:'There was an error fetching the token'
        })
    }
}

module.exports = {register,login,logout,userTokenInfo,requestPasswordReset,verifyPasswordResetToken}