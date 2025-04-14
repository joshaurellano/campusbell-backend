const {sendMail} = require ('../controller/mailController');
const authenticateToken = require('../middleware/authMiddleware');

const express = require('express');

const router = express.Router();

router.post('/mail',sendMail)

module.exports = router;