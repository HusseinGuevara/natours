const AppError = require('../utils/appError.js');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync.js');
const factory = require('./handlerFactory');

// Callback functions for Tour routes

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.createTour = factory.createOne(Tour);


exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    
    //  SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // populate will add the actual data to the query and mot the database, without populate you on get the ID which is the reference point
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if(!tour) {
        return next(new AppError('No tour found with this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        } 
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5}}
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $avg: '$price' },
                maxPrice: { $avg: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
});

exports.getMonthlyPlan = (async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: { 
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates'},
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ])

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
});
