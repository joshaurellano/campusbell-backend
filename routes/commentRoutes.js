const express = require('express');
const{createComment,getAllComments,getCommentByPost,
    getCommentByUser,getComment,updateComment,deleteComment} = require('../controller/commentController');
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/',authenticateToken,createComment);
router.get('/',authenticateToken,getAllComments);
router.get('/post/:id',authenticateToken,getCommentByPost);
router.get('/user/:id',authenticateToken,getCommentByUser);
router.get('/:id',authenticateToken,getComment);
router.put('/:id',authenticateToken,updateComment);
router.delete('/:id',authenticateToken,deleteComment);

module.exports = router