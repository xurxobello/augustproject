'use strict';

const express = require('express');
const createAccount = require('../controllers/create-account-controller');

const router = express.Router();

// definimos la ruta que queremos que el usuario introduzca e indicamos la función controladora
router.post('/accounts', createAccount);

// exportamos router
module.exports = router;