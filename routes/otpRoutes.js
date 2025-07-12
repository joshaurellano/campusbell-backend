const express = require ('express');
const {generate_otp,verify_otp,requestAnotherOtp} = require ('../controller/otpController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate',generate_otp);
router.post('/verify',verify_otp);
router.post('/regenerate',requestAnotherOtp);

module.exports = router;