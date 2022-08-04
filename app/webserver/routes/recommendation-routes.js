'use strict'

const express = require('express');
const multer = require('multer')
const createRecommendation = require('../../webserver/controllers/recommendations/create-recommendation-controller')
const checkAccountSession = require('../controllers/account/check-acount-session')

const upload = multer();

const router = express.Router();

//creamos la ruta, comprobamos que esté logado, con upload.single llamamos a una imagen a la que identificamos en postman como image y llamamos a la función controladora
router.post('/recommendation', checkAccountSession, upload.single('image'), createRecommendation);

module.exports = router;