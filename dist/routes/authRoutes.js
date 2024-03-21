"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/auth/authController");
/**
 * creates a new router object using the express.Router() function.
 * This allows you to define routes and middleware specific to a certain
 * path or endpoint in your Express application.
 */
const router = express_1.default.Router();
/**
 * Authentication Route Middlewares
*/
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/refreshToken', authController_1.token);
router.post('/forgotPassword', authController_1.forgotPassword);
router.patch('/resetPassword/:token', authController_1.resetPassword);
router.patch('/updateMyPassword', authController_1.protect, authController_1.updatePassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map