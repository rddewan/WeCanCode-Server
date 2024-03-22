"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
// environment variables
dotenv_1.default.config({
    path: '.env'
});
const DB = process.env.MONGO_DB?.replace('<PASSWORD>', process.env.MONGO_DB_PASSWORD || '');
mongoose_1.default.connect(DB)
    .then(() => console.log('Connected to MongoDB Successfully'))
    .catch((error) => console.log(error));
const port = process.env.PORT || 3000;
exports.server = app_1.default.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map