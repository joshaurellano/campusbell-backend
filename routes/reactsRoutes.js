const express = require('express');
const{addReact,viewPostReact,viewUserReact,viewAllPostReact,viewAllUserReact} = require('../controller/reactsController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authenticateToken,addReact);
router.get('/post/:id',authenticateToken,viewPostReact);
router.get('/post',authenticateToken,viewAllPostReact);
router.get('/user/:id',authenticateToken,viewUserReact);
router.get('/user',authenticateToken,viewAllUserReact);

module.exports = router