"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
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
exports.default = app;
//# sourceMappingURL=app.js.map