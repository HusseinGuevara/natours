const express = require('express');
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController.js');


// mergerParams allows us to merger the parameters from the tourRouter that we mounted reviewRouter to
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
         authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    )

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)  

module.exports = router;    
