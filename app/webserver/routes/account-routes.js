'use strict';

const express = require('express');
const createAccount = require('../controllers/account/create-account-controller');

const router = express.Router();

// definimos la ruta e indicamos la función controladora
router.post('/accounts', createAccount);

module.exports = router;