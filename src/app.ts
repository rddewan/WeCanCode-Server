import express from 'express';
import morgan from 'morgan';
import authRouter from './routes/authRoutes';
import AppError from './utils/appError';
import { globalErrorHandler } from './utils/globalErrorHandler';

const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Middleware to log requests in development mode only
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
    res.send('Hello From WeCanCode!');
})

/**
 * app.use() method is used to mount middleware functions at a specified path. 
 * In this case, the authRouter middleware will be executed for any incoming requests 
 * that have a path starting with /api/v1/auth
 */
app.use('/api/v1/auth', authRouter);

/**
 * The app.all() middleware function in your code is a catch-all route handler 
 * that gets executed for all incoming requests that do not match any of the defined routes. 
 * This middleware function is used to handle 404 errors, 
 * i.e., when a route is requested that does not exist on the server.
 */
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));    
  },
);

/**
 * The app.use(globalErrorHandler); is responsible for using the globalErrorHandler middleware function 
 * for all incoming requests. This middleware function is used to handle errors 
 * that occur during the request-response cycle.
 */
app.use(globalErrorHandler);

export default app;