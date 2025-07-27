const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const {getAllFriends} = require('../controller/friendController');

const router = express.Router();

router.get('/:id',authenticateToken,getAllFriends);

module.exports = router