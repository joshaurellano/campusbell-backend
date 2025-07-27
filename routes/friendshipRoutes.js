const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const {sendFriendRequest, acceptFriendRequest} = require('../controller/friendshipController');

const router = express.Router();

router.post('/',authenticateToken,sendFriendRequest);
router.post('/accept',authenticateToken, acceptFriendRequest);

module.exports = router