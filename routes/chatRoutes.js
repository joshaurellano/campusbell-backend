const express = require('express');

const {getConvoID} = require('../controller/chatController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id',authenticateToken, getConvoID);

module.exports = router