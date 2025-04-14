const express = require ('express');

const{getAllUsers,getUser,updateUser,updateUserPassword,deleteUser} = require('../controller/userController')
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/',authenticateToken,getAllUsers);
router.get('/:id',authenticateToken,getUser);
router.put('/:id',authenticateToken,updateUser);
router.put('/password/:id',authenticateToken,updateUserPassword);
router.delete('/:id',authenticateToken,deleteUser);

module.exports = router;
