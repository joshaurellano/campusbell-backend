const jwt = require ('jsonwebtoken');
const pool = require ('../config/database');;

const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).json({
            status:'Error',
            message:'Please login first'
        })
    }
    try{
        const verified = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = String(verified.user_id);
        req.user = verified;
        if(req.user.role_id === 4 ){
            return res.status(401).json({
                status:'Error',
                message:'Not yet verified, please check your email'
            })
        }
        console.log(req.user.role_id);
        next();
    } catch(err) {
        res.status(400).json({
            status:'Error',
            message:'Invalid Token'
        });
    }
}

module.exports = authenticateToken;