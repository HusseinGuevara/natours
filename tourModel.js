const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel.js');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        minlength: [10, 'A tour name must have more or equal then 10 characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration.']
    }, 
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a duration.']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.']
    },
    priceDiscount: {
        type: Number,
        validate: {
            // This will only work when creating a new document, not updating
            validator: function(val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price.'
        } 
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, ' A tour must have a description.']
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            // When a document is created, it is automaticly of the rtype ObjectId, or in this case UserId
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, 
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);

// VIRTUAL PROPERTIES: a property that is not stored in MongoDB
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// This middleware will create an array of all the guides that are embededd on the tour document
// tourSchema.pre('save', async function(next) {
//     const guidesPromise = this.guides.map( async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromise);
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true }});
    this.start = Date.now();
    next();
});


// populate will add the actual data to the query and mot the database, without populate you on get the ID which is the reference point
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds.`);
    console.log(docs);
    next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true }}})
    console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;