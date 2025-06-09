const jwt = require ('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

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
                message:'Unverified'
            })
        }
        // console.log(req.user.role_id);
        next();
    } catch(err) {
        res.status(400).json({
            status:'Error',
            message:'Invalid Token'
        });
    }
}

module.exports = authenticateToken;