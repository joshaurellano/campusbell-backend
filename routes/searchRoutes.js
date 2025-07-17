const express = require ('express');

const{searchUser} = require('../controller/searchController')
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/find',authenticateToken,searchUser);

module.exports = router;
