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
    password: process.env.password,
    database: process.env.database,
    connectionLimit: 10
});
pool.getConnection()
    .then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Database connection established');
    yield connection.query(`CREATE DATABASE IF NOT EXISTS hsi21joo4cb74ayy`);
    connection.release();
}))
    .then(() => {
    console.log('Database setup complete');
})
    .catch(error => {
    console.error('Error connecting to database:', error.message);
    process.exit(1);
});
exports.default = pool;
