"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const appError_1 = __importDefault(require("./utils/appError"));
const globalErrorHandler_1 = require("./utils/globalErrorHandler");
const app = (0, express_1.default)();
// Middleware to parse JSON data
app.use(express_1.default.json());
// Middleware to log requests in development mode only
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Routes
app.get('/', (req, res) => {
    res.send('Hello From WeCanCode!');
});
/**
 * app.use() method is used to mount middleware functions at a specified path.
 * In this case, the authRouter middleware will be executed for any incoming requests
 * that have a path starting with /api/v1/auth
 */
app.use('/api/v1/auth', authRoutes_1.default);
/**
 * The app.all() middleware function in your code is a catch-all route handler
 * that gets executed for all incoming requests that do not match any of the defined routes.
 * This middleware function is used to handle 404 errors,
 * i.e., when a route is requested that does not exist on the server.
 */
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
/**
 * The app.use(globalErrorHandler); is responsible for using the globalErrorHandler middleware function
 * for all incoming requests. This middleware function is used to handle errors
 * that occur during the request-response cycle.
 */
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map