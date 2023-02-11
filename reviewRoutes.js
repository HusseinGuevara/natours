const express = require('express');
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect, 
        authController.restrictTo('user'),
        reviewController.createReview
    )

router
    .route('/:id')
    .get(reviewController.getReview);

module.exports = router;    
