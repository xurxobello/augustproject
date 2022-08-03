'use strict'

const express = require('express');
const multer = require('multer')
const createRecommendation = require('../../webserver/controllers/recommendations/create-recommendation-controller')
/*nos falta validar que el usuario esté logado (ivan)*/

const upload = multer();

const router = express.Router();

//creamos la ruta, comprobamos que esté logado, con upload.single llamamos a una imagen a la que identificamos en postman como image y llamamos a la función controladora
router.post('/recommendation'/*, hay que llamar a la función de estar logado (ivan) */, upload.single('image'), createRecommendation);

module.exports = router;