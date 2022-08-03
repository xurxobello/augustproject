'use strict';

const express = require('express');
const loginUser = require('../controllers/login_user_controler.js');

const router = express.Router();

// definimos la ruta que queremos que el usuario introduzca e indicamos la función controladora
router.post('/accounts/:id', loginUser);

// exportamos router
module.exports = router;