"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        unique: true,
        maxlength: [50, 'Name can not be longer than 50 characters'],
        minlength: [4, 'Name can not be less than 4 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator_1.default.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'student', 'admin', 'super-admin'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        maxlength: 20,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator(passwordConfirm) {
                return passwordConfirm === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    createdAt: Date,
    updatedAt: Date,
});
// pre hook middleware : runs before .save() and .create()
// encrypt password
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password'))
        return next();
    // Hash the password with cost of 12
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});
// pre hook middleware : runs before .save() and .create()
// set passwordChangedAt
userSchema.pre('save', function (next) {
    // Only run this function if password was actually modified
    // do not run this middleware if the password is new or is not modified
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
// pre hook middleware : runs before .find()
// finds users who have their active field not equal to false
userSchema.pre(/^find/, function (next) {
    // this points to current query
    this.find({ active: { $ne: false } });
    next();
});
/**
 * Check if the password was changed after a certain time.
 *
 * @param {number} JWTTimestamp - The timestamp to compare against
 * @return {boolean} Returns true if the password was changed after the given timestamp, false otherwise
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    // This checks if a password change timestamp (passwordChangedAt) exists for the user
    // If it doesn't exist, that means the password has never been changed, 
    // so it skips to the end of the function and returns false.
    if (this.passwordChangedAt) {
        // .getTime(), which gives the timestamp in milliseconds, and then dividing by 1000 to convert it to seconds
        const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};
/**
 * Generates a password reset token, encrypts it, sets the expiration time, and returns the unencrypted token.
 *
 * @return {string} The unencrypted password reset token
 */
userSchema.methods.createPasswordResetToken = function () {
    // generates 32 random bytes. It is then converted to a hexadecimal string using toString('hex')
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    // encrypt the token: This creates a SHA-512 hash of the resetToken
    this.passwordResetToken = crypto_1.default.createHash('sha512').update(resetToken).digest('hex');
    // sets an expiration time for the reset token - expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // return the unencrypted token
    return resetToken;
};
const User = mongoose_1.default.model('User', userSchema, 'users');
exports.default = User;
//# sourceMappingURL=userModel.js.map