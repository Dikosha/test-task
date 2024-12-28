const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authenticate = require('../middlewares/authenticate');
const upload = require('../middlewares/upload');

router.post('/upload', authenticate, upload.single('file'), fileController.uploadFile);
router.get('/list', authenticate, fileController.getFiles);
router.get('/', authenticate, fileController.getFile);
router.delete('/delete', authenticate, fileController.deleteFile)
router.get('/download', authenticate, fileController.downloadFile)
router.put('/update', authenticate, upload.single('file'), fileController.updateFile)

module.exports = router;
