"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const library_controllers_1 = require("../controllers/library.controllers");
const router = express_1.default.Router();
//Resource Library - General Rules
router.get('/get-pdf/:schoolGroup_id', library_controllers_1.getPDFBySchoolGroupId);
router.post('/upload-pdf', library_controllers_1.uploadMiddleware, library_controllers_1.uploadOrUpdatePDF);
//Resource Library - Q and A
router.post('/questions', library_controllers_1.createQuestion);
router.delete('/questions/:QandA_id', library_controllers_1.deleteQuestion);
router.put('/questions/:QandA_id/answer', library_controllers_1.addAnswer);
router.get('/questions/:QandA_id', library_controllers_1.getQuestion);
router.get('/answers/schoolGroup/:schoolGroup_id', library_controllers_1.getAnswersBySchoolGroupId);
exports.default = router;
