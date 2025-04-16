const express = require ('express');
const { imageUpload } = require('../controller/imgUploadController');
const upload = require('../middleware/multerMiddleware');

const router = express.Router();

router.post('/images', upload.single('image'), imageUpload);

module.exports = router;