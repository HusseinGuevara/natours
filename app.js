const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const userRouter = require('./routes/userRoutes.js');
const tourRouter = require('./routes/tourRoutes.js');

const app = express();

// 1) Global Middleware

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanatization against XXS, 
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({ 
        whitelist: [
            'duration', 
            'ratingsAverage', 
            'ratingsQuantity', 
            'maxGroupSize', 
            'difficulty', 
            'price'
        ]
    })
);

// Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

// This will only allow 100 request in a hour from an IP address to help prevent and DOS attacks and any brute froce attempts at getting a password
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Serving static files
// app.use(express.static(`${__dirname/public}`));

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

// 2) Routes
app.use('/api/v1/users', userRouter);  
app.use('/api/v1/tours', tourRouter);

// This route will handle all routes that have not been created yet
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;