const express = require('express');
const {createReport,getAllReports,getAllReportsByStatus, getAllReportsByType,
     getAllReportsByClassification,updateReports,deleteReports} = require('../controller/reportController');
const authenticateToken = require('../middleware/authMiddleware');
const adminAuthenticateToken = require('../middleware/adminMiddleware');


const router = express.Router();

router.post('/',authenticateToken,createReport);
router.get('/',adminAuthenticateToken,getAllReports);
router.get('/status/:id',adminAuthenticateToken,getAllReportsByStatus);
router.get('/type/:id',adminAuthenticateToken,getAllReportsByType);
router.get('/classification/:id',adminAuthenticateToken,getAllReportsByClassification);
router.put('/:id',adminAuthenticateToken,updateReports);
router.delete('/:id',adminAuthenticateToken,deleteReports);

module.exports = router;