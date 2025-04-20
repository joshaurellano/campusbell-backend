const express = require('express');
const {getTopics,addTopics,updateTopics,deleteTopics} = require ('../controller/topicsController');

const router = express.Router();

router.get('/',getTopics),
router.post('/',addTopics),
router.put('/:id',updateTopics),
router.delete('/:id',deleteTopics),

module.exports = router;