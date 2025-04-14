const express = require ('express');

const {createReply,getAllReply,getAllReplyByComments,
    getAllReplyByUser,getReply,updateReply,deleteReply} = require('../controller/replyController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/',authenticateToken,createReply);
router.get('/',authenticateToken,getAllReply);
router.get('/comment/:id',authenticateToken,getAllReplyByComments);
router.get('/user/:id',authenticateToken,getAllReplyByUser);
router.get('/:id',authenticateToken,getReply);
router.put('/:id',authenticateToken,updateReply);
router.delete('/id',authenticateToken,deleteReply);

module.exports = router