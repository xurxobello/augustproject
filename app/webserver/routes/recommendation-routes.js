'use strict'

const express = require('express');
const multer = require('multer');
const checkAccountSession = require('../controllers/account/check-acount-session');
const createRecommendation = require('../../webserver/controllers/recommendations/create-recommendation-controller');
const getDetailRecommendation = require('../controllers/recommendations/get-recommendation-detail-controller');
const getPlaceOrCategoryRecommendations = require('../controllers/recommendations/get-recommendation-filter-controller');
const deleteRecommendation = require('../controllers/recommendations/delete-recommendation-controller');
const likeRecom = require('../controllers/recommendations/like-recommendation');
const dislikeRecom = require('../controllers/recommendations/dislike-recommendation');
const createComment = require('../controllers/comments/create-comment-controller');

const upload = multer();

const router = express.Router();

//creamos las rutas, comprobamos que esté logado, con upload.single llamamos a una imagen a la que identificamos en postman como image y llamamos a la función controladora
router.post('/recommendations', checkAccountSession, upload.single('caption'), createRecommendation);
router.get('/recommendations', getPlaceOrCategoryRecommendations)
router.get('/recommendations/:id', getDetailRecommendation)
router.delete('/recommendations/:recommendationId', checkAccountSession, deleteRecommendation)
router.post('/recommendations/:recommendationId/likes', checkAccountSession, likeRecom);
router.delete('/recommendations/:recommendationId/likes', checkAccountSession, dislikeRecom);
router.post('/recommendations/:recommendationId/comments', checkAccountSession, createComment);

module.exports = router;