const express = require('express');
const {register,login,logout,userTokenInfo,requestPasswordReset} = require('../controller/authController')
const{userValidationRules,validate} = require('../middleware/validator')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router();

router.post('/register',userValidationRules(),validate,register); 
router.post('/login',login);
router.get('/',authenticateToken,userTokenInfo);
router.post('/logout',logout);
router.post('/password-reset',requestPasswordReset)

module.exports = router;