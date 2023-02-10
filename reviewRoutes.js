const express = require('express');
const reviewController = require('./../controllers/reviewController.js');

const router = express.Router();

router
    .route('/')
    .post(reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview);

module.exports = router;    
