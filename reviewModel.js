const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A tour review is required.'],
        minLength: [20, 'A tour must have atleast 20 charecters.']
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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;