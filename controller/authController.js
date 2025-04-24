const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/*Add input validation using express validation. Add the function on middleware folder*/

//User registration
const register = async (req,res) => {
    const {username,password,first_name,middle_name,last_name,email,phone_number,yr_lvl,program,region,province,city,town,barangay,street,house_no, role_id} = req.body;
    
    const saltRounds = 10; 
/*The fields here are the fields that have NOT NULL constraints on database*/
    if(!username||!password||!email||!phone_number||!first_name||!last_name){
        return res.status(400).json({
            status:'Error',
            message:'Necessary fields missing'
        });
    }
    try{
        //password hashing 
        const hashedPass = await bcrypt.hash(password, saltRounds);
        const [rows] = await pool.query(`INSERT INTO user_profile (
            username,password,
            first_name,middle_name,last_name,
            email,phone_number,
            region,province,city,town,barangay,street,house_no) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[username,hashedPass,first_name,middle_name,last_name,email,phone_number,yr_lvl,program,region,province,city,town,barangay,street,house_no]
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
            return res.status(409).json({
                status:'Error',
                message:'Duplicate entry detected'
            });
        }
        //Other database error that is not handled here
        else{
            console.log(err);
            return res.status(500).json({
                status:'Error',
                message:'There was an error processing the request'
            });
        }
    }

}  
const login = async (req,res) => {
    const {username, password} = req.body;
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

        return res.status(200).json({
            status:'Success',
            message:'Login successful'});

    } catch(error) {
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

module.exports = {register,login,logout,userTokenInfo}