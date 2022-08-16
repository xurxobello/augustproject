'use strict';

const express = require('express');
const multer = require('multer');
const checkAccountSession = require('../controllers/account/check-acount-session');
const uploadAvatar = require('../controllers/user/upload-avatar-controller');
const updateUser = require('../controllers/user/update-user-controller');



const upload = multer();

const router = express.Router();


router.post('/users/avatar', checkAccountSession, upload.single('avatar'), uploadAvatar);
router.put('/users/update', checkAccountSession, updateUser);

module.exports = router;