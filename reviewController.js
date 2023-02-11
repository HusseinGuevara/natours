const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync.js');

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});

// A function to get a specific review
exports.getReview = catchAsync( async (req, res, next) => { 
    const review = await Review.findById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            review: review
        }
    });
});

exports.getAllReviews = catchAsync( async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});