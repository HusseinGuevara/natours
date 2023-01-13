const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const userRouter = require('./routes/userRoutes.js');
const tourRouter = require('./routes/tourRoutes.js');

const app = express();

// 1) Middleware
app.use(express.json());

console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use((req, res, next) => {
    console.log('Hello from the middleware!')
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
})

// 2) Routes
app.use('/api/v1/users', userRouter);  
app.use('/api/v1/tours', tourRouter);

// This route will handle all routes that have not been created yet
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler)

module.exports = app;