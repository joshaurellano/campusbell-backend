const express = require('express')
const{addToWall,getAllFromWall,getSpecificNotes,updateNote,deleteNote} = require ('../controller/freedomwallController');
const authenticateToken = require ('../middleware/authMiddleware')

const router = express.Router()

router.post('/',authenticateToken,addToWall);
router.get('/',authenticateToken,getAllFromWall);
router.get('/:id',authenticateToken,getSpecificNotes);
router.put('/:id',authenticateToken,updateNote);
router.delete('/:id',authenticateToken,deleteNote);

module.exports = router