const express = require("express");
const { uplaodSingleFile, uplaodFiles, downloadFile } = require("../controllers/file");
const loginRequire = require("../middleware/jwt/loginRequire");
const { upload } = require("../middleware/multer");
const router = express.Router();

//ulpoad file
router.post('/uplaod-file',upload.single('file'), uplaodSingleFile)
router.post('/uplaod-files',upload.array('file'), uplaodFiles)

//download file
router.get('/download-file/:fileName', downloadFile)

module.exports = router;
