const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A tour review is required.'],
        minLength: [10, 'A tour must have atleast 10 charecters.']
    },
    rating: {
        type: Number,
        required: [true, 'A tour must have a rating.'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Review must belong to a user.']
    }

},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Query Middleware
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name'
    }).populate({
        path: 'tour',
        select: 'name'
    })
    next();
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;