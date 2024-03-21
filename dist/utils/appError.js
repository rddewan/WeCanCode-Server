"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    /**
     * Constructor for creating a new Error instance.
     *
     * @param {string} message - the error message
     * @param {number} statusCode - the status code of the error
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
//# sourceMappingURL=appError.js.map