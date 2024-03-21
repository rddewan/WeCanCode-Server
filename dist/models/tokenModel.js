"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const tokenSchema = new mongoose_1.default.Schema({
    refreshToken: {
        type: String,
        required: [true, 'You must pass a refresh token'],
        unique: true,
        select: false,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d',
    },
    expiresAt: {
        type: Date,
        default: Date.now() + 7 * 24 * 60 * 60 * 1000,
        expires: '7d',
    },
    type: {
        type: String,
        required: true,
        enum: ['access', 'refresh'],
    },
});
/**
 * Encrypts the given token using the SHA-512 algorithm and returns the resulting hash as a hexadecimal string.
 *
 * @param {string} token - The token to be encrypted
 * @return {string} The SHA-512 hash of the input token as a hexadecimal string
 */
tokenSchema.methods.createRefreshTokenHash = function (token) {
    // encrypt the token
    /*
    [crypto.createHash('sha512')]
    This line of code creates and returns a hash object, a cryptographic hash with the specified algorithm.
    In this case, it's 'sha512', which is a very secure hash.
  
    [.update(token)]
    Then, you're calling update method on the hash object.
    The update() method can be called multiple times with new data until digest() is called.
    The update() method updates the hash content with the given data, 'token' in this case. This 'token' could be anything - a password, a secret key etc.
  
   [ .digest('hex')]
    Finally, digest() method is called which returns the computed hash.
    The output format is defined by 'hex', meaning the returned hash will be a hexadecimal string.
  
    This whole line of code thus creates a SHA-512 hash of whatever 'token' is, and returns it as a hexadecimal string.
    This is particularly useful in things like storing passwords, where you don't actually store user's password, but a hash of it.
    Hence, even if someone gets access to the hash, they can't reverse-engineer it to get the original password.
    */
    const refreshToken = crypto_1.default.createHash('sha512').update(token).digest('hex');
    return refreshToken;
};
const Token = mongoose_1.default.model('Token', tokenSchema, 'tokens');
exports.default = Token;
//# sourceMappingURL=tokenModel.js.map