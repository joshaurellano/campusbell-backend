const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const {sendFriendRequest, acceptFriendRequest} = require('../controller/friendController');

const router = express.Router();

router.post('/',authenticateToken,sendFriendRequest);
router.put('/accept',authenticateToken, acceptFriendRequest);

module.exports = router