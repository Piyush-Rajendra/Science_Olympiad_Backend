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
exports.createTables = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const createTables = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS ResourceLibrary (
            resourceLibrary_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            pdf_input LONGBLOB NOT NULL,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS QandA (
            QandA_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            Question TEXT NOT NULL,
            Answer TEXT,
            isAnswered TINYINT(1) NOT NULL,
            lastUpdated DATETIME NOT NULL,
            createdOn DATETIME NOT NULL,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
        console.log('Tables created successfully');
    }
    catch (error) {
        console.error('Error creating tables', error);
    }
});
exports.createTables = createTables;
