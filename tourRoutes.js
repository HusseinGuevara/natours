const express = require('express');
const fs = require('fs');
const tourController = require('./../controllers/tourController.js');
const authController = require('./../controllers/authController.js');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// Mount Review Router onto the tour router. Similiar to how I did on app.js
router.use('/:tourId/reviews', reviewRouter);

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

module.exports = router;    