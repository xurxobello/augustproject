'use strict'

const express = require('express');
const multer = require('multer')
const checkAccountSession = require('../controllers/account/check-acount-session');
const createRecommendation = require('../../webserver/controllers/recommendations/create-recommendation-controller')
const getDetailRecommendation = require('../controllers/recommendations/get-recommendation-detail-controller')
const getPlaceOrCategoryRecommendations = require('../controllers/recommendations/get-recommendation-filter-controller');

const upload = multer();

const router = express.Router();

//creamos las rutas, comprobamos que esté logado, con upload.single llamamos a una imagen a la que identificamos en postman como image y llamamos a la función controladora
router.post('/recommendation', checkAccountSession, upload.single('caption'), createRecommendation);
router.get('/recommendations', getPlaceOrCategoryRecommendations)
router.get('/recommendations/:id', getDetailRecommendation)

module.exports = router;