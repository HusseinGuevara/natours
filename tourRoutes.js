const express = require('express');
const fs = require('fs');
const tourController = require('./../controllers/tourController.js');
const authController = require('./../controllers/authController.js');
const reviewController = require('./../controllers/reviewController');


const router = express.Router();

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)
    
router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/')
    .get(authController.protect ,tourController.getAllTours)
    .post(tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );  

router
    .route('/:tourId/reviews')
    .post(
        authController.protect, 
        authController.restrictTo('user'), 
        reviewController.createReview
    );

module.exports = router;    