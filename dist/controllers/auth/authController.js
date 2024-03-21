"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.restrict = exports.protect = exports.token = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const tokenModel_1 = __importDefault(require("../../models/tokenModel"));
const catch_async_1 = __importDefault(require("../../utils/catch_async"));
const email_1 = __importDefault(require("../../utils/email"));
const appError_1 = __importDefault(require("../../utils/appError"));
const util_1 = require("util");
/**
 * Generate a JWT access token for the given ID.
 *
 * @param {string} id - The ID to be included in the token
 * @return {string} The generated JWT token
 */
const generateAccessToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: process.env.JWT_EXPIRES_IN,
});
/**
 * Generate a refresh token for a given ID.
 *
 * @param {string} id - The ID to generate the token for
 * @return {string} The generated refresh token
 */
const generateRefreshToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH || '', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
});
/**
 * Creates and sends tokens to the user for authentication.
 *
 * @param {IUser} user - The user object to generate tokens for.
 * @param {number} statusCode - The HTTP status code to send in the response.
 * @param {Response} res - The response object to send the tokens to.
 * @return {Promise<void>} A promise that resolves when tokens are created and sent.
 */
const createSendToken = async (user, statusCode, res) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const expiresIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "0", 10);
    const cookieOptions = {
        // 24 = hours 60 = minutes 60 = seconds 1000 = milliseconds
        expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    res.cookie('jwt', accessToken, cookieOptions);
    // delete old refresh token
    await tokenModel_1.default.deleteMany({ userId: { $eq: user._id } });
    // hash refresh token
    const refreshTokenHash = crypto_1.default.createHash('sha512').update(refreshToken).digest('hex');
    // create refresh token
    const token = await tokenModel_1.default.create({
        refreshToken: refreshTokenHash,
        userId: user._id,
        type: 'refresh',
    });
    res.status(statusCode).json({
        status: 'success',
        accessToken: accessToken,
        refreshToken: refreshToken,
        refreshTokenExpiresIn: token.expiresAt,
    });
};
/**
 * Verify a JWT token using the provided secret.
 *
 * @param {string} token - the JWT token to verify
 * @param {string} secret - the secret key to use for verification
 * @return {Promise<any>} the decoded payload of the JWT token
 */
async function verifyJwt(token, secret) {
    // Wrap jwt.verify with promisify
    const verify = (0, util_1.promisify)(jsonwebtoken_1.default.verify);
    try {
        // Use the promisified verify function
        const decoded = await verify(token, secret);
        return decoded;
    }
    catch (err) {
        console.log(err);
    }
}
// signup new user
exports.signup = (0, catch_async_1.default)(async (req, res, next) => {
    const newUser = await userModel_1.default.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new email_1.default(newUser, url).sendWelcomeEmail();
    // jsend format
    res.status(201).json({
        status: 'success',
        data: {
            user: {
                name: newUser.name,
                email: newUser.email,
            },
        },
    });
});
// login user
exports.login = (0, catch_async_1.default)(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password exist
    if (!email || !password) {
        return next(new appError_1.default('Please provide email and password!', 400));
    }
    // check if user exists and password is correct
    const user = await userModel_1.default.findOne({ email: email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new appError_1.default('Incorrect email or password', 401));
    }
    // send token to client
    createSendToken(user, 200, res);
});
// create new JWT token
exports.token = (0, catch_async_1.default)(async (req, res, next) => {
    // check if refresh token exists
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return next(new appError_1.default('Your refresh token is missing.', 401));
    }
    // verify refresh token 
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
    const decoded = await verifyJwt(refreshToken, JWT_REFRESH_SECRET);
    // check if user still exists - for security reasons dont not return error here if user does not exist
    const user = await userModel_1.default.findById(decoded.id);
    // check if the user exist in token collection
    let token = await tokenModel_1.default.findOne({ userId: decoded.id }).select('+refreshToken');
    // create  a hash of the refresh token
    const refreshTokenHash = token.createRefreshTokenHash(refreshToken);
    // check if refresh token still exists in token collection
    token = await tokenModel_1.default.findOne({ refreshToken: refreshTokenHash }).select('+refreshToken');
    // return error if no user or refresh token does not exist - 
    // for security reasons do not let user know if user does not exist or refresh token does not exist
    if (!user || !token) {
        return next(new appError_1.default('User or token does not exist.', 401));
    }
    // create and send new token
    createSendToken(user, 200, res);
});
// protect routes
exports.protect = (0, catch_async_1.default)(async (req, res, next) => {
    // get the token from header and check if it is there
    let token;
    // destructure the headers object
    const { headers } = req;
    // check if token exists
    if (headers.authorization && headers.authorization.startsWith('Bearer')) {
        token = headers.authorization.split(' ')[1];
    }
    // if no auth token, return error
    if (!token) {
        return next(new appError_1.default('You are not logged in! Please log in to get access.', 401));
    }
    // verify the token
    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = await verifyJwt(token, JWT_SECRET);
    // check if user still exists
    const currentUser = await userModel_1.default.findById(decoded.id);
    // if no user, return error
    if (!currentUser) {
        return next(new appError_1.default('The user belonging to this token does no longer exist.', 401));
    }
    // if user changed password after token was issued - return error
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError_1.default('User recently changed password! Please log in again.', 401));
    }
    // puts the user in the request object
    req.user = currentUser;
    // go to next middleware
    next();
});
/**
 * Restricts access to a route based on user roles.
 *
 * @param {string[]} roles - The roles that are allowed to access the route.
 * @param {CustomRequest} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function to be called.
 * @return {void} This function does not return anything.
 */
const restrict = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new appError_1.default('You do not have permission to perform this action', 403));
    }
    next();
};
exports.restrict = restrict;
// forgot password
exports.forgotPassword = (0, catch_async_1.default)(async (req, res, next) => {
    // get user based on posted email
    const user = await userModel_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError_1.default('There is no user with email address.', 404));
    }
    // generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    try {
        // send password reset email
        await new email_1.default(user, resetURL).sendPasswordResetEmail();
        // send response
        res.status(200).json({
            status: 'success',
            message: 'password reset token sent to email!',
        });
    }
    catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new appError_1.default('There was an error sending the email. Try again later!', 500));
    }
});
// reset user password
exports.resetPassword = (0, catch_async_1.default)(async (req, res, next) => {
    // hash the password reset token sent in the url
    const hashedToken = crypto_1.default.createHash('sha512').update(req.params.token).digest('hex');
    // check if user exists and token is not expired
    const user = await userModel_1.default.findOne({
        passwordResetToken: hashedToken,
        // expiry time is greater then now
        passwordResetExpires: { $gt: Date.now() },
    });
    // if token has not expired and there is user, set the new password
    if (!user) {
        return next(new appError_1.default('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // clear the reset token and expiry time
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // save the new password
    await user.save();
    // update changedPasswordAt property for the user
    // log the user in, send JWT
    createSendToken(user, 200, res);
});
// update user password
exports.updatePassword = (0, catch_async_1.default)(async (req, res, next) => {
    // get user from collection
    const user = await userModel_1.default.findById(req.user.id).select('+password');
    // check if posted password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError_1.default('Your current password is wrong.', 401));
    }
    // if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // why we cannot use update function here?
    // because we need to validate confirm password and ew need to pre save middleware
    await user.save();
    // log user in, send JWT
    createSendToken(user, 200, res);
});
//# sourceMappingURL=authController.js.map