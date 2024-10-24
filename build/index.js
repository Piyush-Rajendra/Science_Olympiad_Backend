"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const data_middleware_1 = require("./middlewares/data.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/auth', auth_routes_1.default);
app.use(data_routes_1.default);
//Expand PDF Storage
app.use(express_1.default.json({ limit: '500mb' }));
app.use(express_1.default.urlencoded({ limit: '500mb', extended: true }));
app.use((req, res, next) => {
    req.setTimeout(600000); // 600 seconds
    next();
});
// Create tables before starting the server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First create the regular tables
        yield (0, auth_middleware_1.createTables)();
        // Then create the data tables
        yield (0, data_middleware_1.createDataTables)();
        // After both succeed, start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error starting the server:', error);
        process.exit(1); // Exit process on failure
    }
});
startServer();
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error.message);
    process.exit(1); // Exit the process or handle the error as per your application's needs
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle the error as per your application's needs
});
