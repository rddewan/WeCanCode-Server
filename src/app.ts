import express from 'express';
import morgan from 'morgan';

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

export default app;