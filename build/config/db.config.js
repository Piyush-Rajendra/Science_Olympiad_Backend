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
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = require("mysql2/promise");
require('dotenv').config();
const pool = (0, promise_1.createPool)({
    host: process.env.host,
    user: process.env.user,
    password: process.env.pass,
    database: process.env.database,
    connectionLimit: 10
});
pool.getConnection()
    .then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Database connection established');
    // Check if the database exists, create it if it doesn't
    yield connection.query(`CREATE DATABASE IF NOT EXISTS oro04mqr28yny1ki`);
    connection.release();
}))
    .then(() => {
    console.log('Database setup complete');
})
    .catch(error => {
    console.error('Error connecting to database:', error.message);
    process.exit(1); // Exit the process or handle the error as per your application's needs
});
exports.default = pool;
