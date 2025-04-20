const express = require('express');
const {getTopics,addTopics,updateTopics,deleteTopics} = require ('../controller/topicsController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',authenticateToken,getTopics);
router.post('/',authenticateToken,addTopics);
router.put('/:id',authenticateToken,updateTopics);
router.delete('/:id',authenticateToken,deleteTopics);

module.exports = router;