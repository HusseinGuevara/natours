const express = require('express');
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController.js');


// mergerParams allows us to merger the parameters from the tourRouter that we mounted reviewRouter to
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect, 
        authController.restrictTo('user'),
        reviewController.createReview
    )

router
    .route('/:id').delete(reviewController.deleteReview)  


module.exports = router;    
