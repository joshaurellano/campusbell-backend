const express = require('express');
const {register,login} = require('../controller/authController')
const{userValidationRules,validate} = require('../middleware/validator')

const router = express.Router();
router.post('/register',userValidationRules(),validate,register); 
router.post('/login',login)

module.exports = router;