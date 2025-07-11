const express = require ('express');

const{getAllUsers,getUser,updateUser,updateProfileImage,updateUserPassword,deleteUser} = require('../controller/userController')
const authenticateToken = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/',authenticateToken,getAllUsers);
router.get('/:id',authenticateToken,getUser);
router.put('/profile-image',authenticateToken,updateProfileImage);
router.put('/password/:token',updateUserPassword);
router.put('/:id',authenticateToken,updateUser);
router.delete('/:id',authenticateToken,deleteUser);

module.exports = router;
