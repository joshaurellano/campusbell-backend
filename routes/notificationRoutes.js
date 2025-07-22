const express = require ('express');
const {getAllAlerts,getAlert,getAlertByPost,updateAlert} = require ('../controller/notificationController');
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/',authenticateToken,getAllAlerts);
router.get('/user/:id',authenticateToken,getAlert);
router.get('/post/:id',authenticateToken,getAlertByPost);
router.put('/:id',authenticateToken,updateAlert);

module.exports = router;