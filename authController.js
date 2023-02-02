const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError.js');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');
const { use } = require('../routes/userRoutes.js');


// This will create a JWT token for the user
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser =  await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
    console.log(newUser)
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password} = req.body;

    // 1) Check if email and password exist
    if(!email || !password) {
        return next(new AppError('Please provide email and password!'), 400);
    }
    // 2) Check if user exist and password is correct 
    const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword( password, user.password))) {
        return next(new AppError('Incorrect email or password.', 401));
    }
    
    // 3) If everything is ok, send token to client
    const token = signToken(user._id);
    // console.log("pre:", token)
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync( async (req, res, next) => {
    // 1) Getting token and check if its there
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    };

    if(!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401));
    };
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if(!freshUser) {
        return next(new AppError('The user belonging to this token no longer exist!', 401));
    };

    // 4) Check if user changed password after the token was issued
    if(freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    };

    // Grant access to protected route
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role)
        // roles ['admin', 'lead-guide']
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
        return next(new AppError('Their is no user with that email adress.', 404 ));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});

    // 3 Send it to user's email: req.protocol = http
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and
    new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please igmore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes).',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!' 
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false});

        return next(new AppError('Their was an error sending the email. Try again later!'), 500)
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token
    const hashedToken = crypto
        // sha256 generates an unique 256-bit (32-byte) signature
        .createHash('sha256')
        // this is the string that we want to hash
        .update(req.params.token)
        // digest converts it to hexadecimal
        .digest('hex');

    const user = await User.findOne({ 
        passwordResetToken: hashedToken, 
        passwordResetExpires : { $gt: Date.now() }
    });    

    // 2) If token has not expired, and their is a user, set the new password
    if(!user) {
        return next(new AppError('Token is invalid or has expired.', 400))
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT 
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    })
});