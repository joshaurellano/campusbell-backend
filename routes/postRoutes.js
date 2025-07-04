const express = require('express');
const {createNewPost,getAllPost,getPost,getPostBy,getPostByTopic,updatePost,deletePost} = require('../controller/postController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authenticateToken,createNewPost);
router.get('/all/:user_id',authenticateToken,getAllPost);
router.get('/:id/user/:user_id',authenticateToken,getPost);
router.get('/user/:id',authenticateToken,getPostBy);
router.get('/topic/:id',authenticateToken,getPostByTopic);
router.put('/:id',authenticateToken,updatePost);
router.delete('/:id',authenticateToken,deletePost);

module.exports = router;