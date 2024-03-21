
import express from 'express';

import { signup, login, token, forgotPassword, resetPassword, updatePassword, protect  } from '../controllers/auth/authController';


/**
 * creates a new router object using the express.Router() function.
 * This allows you to define routes and middleware specific to a certain 
 * path or endpoint in your Express application.
 */
const router = express.Router();

/**
 * Authentication Route Middlewares
*/
router.post('/signup', signup);
router.post('/login', login);
router.post('/refreshToken', token);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);


export default router;