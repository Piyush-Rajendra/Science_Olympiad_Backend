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
exports.editQA = exports.deletePDF = exports.getQuestionsBySchoolGroupId = exports.getAnswerByQandAId = exports.editAnswer = exports.editQuestion = exports.getAnswersBySchoolGroupId = exports.getQuestion = exports.addAnswer = exports.deleteQuestion = exports.getQandAByQuestionAndSchoolGroupId = exports.createQuestion = exports.uploadMiddleware = exports.getPDFBySchoolGroupId = exports.uploadOrUpdatePDF = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
// Configure multer for file uploads with a size limit of 4GB
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 } // 16 MB limit
});
// Function to upload or update a PDF for a given schoolGroup_id
const uploadOrUpdatePDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schoolGroup_id } = req.body;
    const pdfFile = req.file;
    // Validate input
    if (!pdfFile) {
        return res.status(400).json({ message: 'PDF file is required' });
    }
    if (!schoolGroup_id) {
        return res.status(400).json({ message: 'schoolGroup_id is required' });
    }
    try {
        const pdfData = pdfFile.buffer; // Ensure pdfData is treated as Buffer
        // Check if an entry already exists for the given schoolGroup_id
        const [rows] = yield db_config_1.default.execute('SELECT * FROM resourcelibrary WHERE schoolGroup_id = ?', [schoolGroup_id]);
        const existingEntry = rows;
        if (existingEntry.length > 0) {
            // Update the existing entry with the new PDF data
            yield db_config_1.default.execute('UPDATE resourcelibrary SET pdf_input = ? WHERE schoolGroup_id = ?', [pdfData, schoolGroup_id]);
            res.status(200).json({ message: 'PDF updated successfully' });
        }
        else {
            // Insert a new entry if none exists for the given schoolGroup_id
            const [result] = yield db_config_1.default.execute('INSERT INTO resourcelibrary (schoolGroup_id, pdf_input) VALUES (?, ?)', [schoolGroup_id, pdfData]);
            res.status(201).json({ message: 'PDF uploaded successfully', resourceLibrary_id: result.insertId });
        }
    }
    catch (error) {
        console.error('Error uploading or updating PDF:', error);
        res.status(500).json({ message: 'Error uploading or updating PDF', error: error.message });
    }
});
exports.uploadOrUpdatePDF = uploadOrUpdatePDF;
// Function to get a PDF by schoolGroup_id
const getPDFBySchoolGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);
    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }
    try {
        // Query the database for the PDF
        const [rows] = yield db_config_1.default.execute('SELECT pdf_input FROM resourcelibrary WHERE schoolGroup_id = ?', [schoolGroup_id]);
        const result = rows;
        if (result.length === 0) {
            return res.status(404).json({ message: 'No PDF found for the given schoolGroup_id' });
        }
        const pdfData = result[0].pdf_input; // Ensure pdfData is treated as Buffer
        // Set appropriate headers for sending the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=school_${schoolGroup_id}_document.pdf`);
        // Send the binary data of the PDF
        res.status(200).send(pdfData);
    }
    catch (error) {
        console.error('Error retrieving PDF:', error);
        res.status(500).json({ message: 'Error retrieving PDF', error: error.message });
    }
});
exports.getPDFBySchoolGroupId = getPDFBySchoolGroupId;
// Middleware for handling file uploads with multer
exports.uploadMiddleware = upload.single('pdf');
// Create a question
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schoolGroup_id, Question, Answer, tournament_id } = req.body;
    // Validate input
    if (!schoolGroup_id || !Question) {
        return res.status(400).json({ message: 'schoolGroup_id and Question are required' });
    }
    try {
        const createdOn = new Date();
        const isAnswered = Answer ? 1 : 0; // Set isAnswered to 1 if an answer is provided, otherwise 0
        const [result] = yield db_config_1.default.execute('INSERT INTO QandA (schoolGroup_id, Question, Answer, isAnswered, createdOn, lastUpdated, tournament_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [schoolGroup_id, Question, Answer || null, isAnswered, createdOn, createdOn, tournament_id]);
        res.status(201).json({
            message: 'Question created successfully',
            QandA_id: result.insertId
        });
    }
    catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
});
exports.createQuestion = createQuestion;
const getQandAByQuestionAndSchoolGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Question, schoolGroup_id } = req.params;
    // Validate input
    if (!Question || !schoolGroup_id) {
        return res.status(400).json({ message: 'Question and schoolGroup_id are required' });
    }
    try {
        const [result] = yield db_config_1.default.execute('SELECT QandA_id, Question, Answer, isAnswered FROM QandA WHERE Question = ? AND schoolGroup_id = ?', [Question, schoolGroup_id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Question not found for the given schoolGroup_id' });
        }
        res.status(200).json(result[0]); // Return the QandA_id and related details found
    }
    catch (error) {
        console.error('Error retrieving question and answer:', error);
        res.status(500).json({ message: 'Error retrieving question and answer', error: error.message });
    }
});
exports.getQandAByQuestionAndSchoolGroupId = getQandAByQuestionAndSchoolGroupId;
// Delete a question
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    // Validate input
    if (!QandA_id) {
        return res.status(400).json({ message: 'Invalid QandA_id' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM QandA WHERE QandA_id = ?', [QandA_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
});
exports.deleteQuestion = deleteQuestion;
// Add an answer to a question
const addAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    const { Answer } = req.body;
    // Validate input
    if (!QandA_id || !Answer) {
        return res.status(400).json({ message: 'QandA_id and Answer are required' });
    }
    try {
        const lastUpdated = new Date();
        const [update] = yield db_config_1.default.execute('UPDATE QandA SET Answer = ?, isAnswered = 1, lastUpdated = ? WHERE QandA_id = ?', [Answer, lastUpdated, QandA_id]);
        if (update.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Answer added successfully' });
    }
    catch (error) {
        console.error('Error adding answer:', error);
        res.status(500).json({ message: 'Error adding answer', error: error.message });
    }
});
exports.addAnswer = addAnswer;
// Get a question by QandA_id
const getQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    // Validate input
    if (!QandA_id) {
        return res.status(400).json({ message: 'Invalid QandA_id' });
    }
    try {
        const [result] = yield db_config_1.default.execute('SELECT * FROM QandA WHERE QandA_id = ?', [QandA_id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(result[0]);
    }
    catch (error) {
        console.error('Error retrieving question:', error);
        res.status(500).json({ message: 'Error retrieving question', error: error.message });
    }
});
exports.getQuestion = getQuestion;
// Get answers for a schoolGroup_id
const getAnswersBySchoolGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);
    // Validate input
    if (!schoolGroup_id) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }
    try {
        const [result] = yield db_config_1.default.execute('SELECT * FROM QandA WHERE schoolGroup_id = ? AND isAnswered = 1', [schoolGroup_id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No answered questions found for the given schoolGroup_id' });
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error retrieving answers:', error);
        res.status(500).json({ message: 'Error retrieving answers', error: error.message });
    }
});
exports.getAnswersBySchoolGroupId = getAnswersBySchoolGroupId;
// Edit a question
const editQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    const { Question } = req.body;
    // Validate input
    if (!QandA_id || !Question) {
        return res.status(400).json({ message: 'QandA_id and Question are required' });
    }
    try {
        const lastUpdated = new Date();
        const [update] = yield db_config_1.default.execute('UPDATE QandA SET Question = ?, lastUpdated = ? WHERE QandA_id = ?', [Question, lastUpdated, QandA_id]);
        if (update.affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question updated successfully' });
    }
    catch (error) {
        console.error('Error editing question:', error);
        res.status(500).json({ message: 'Error editing question', error: error.message });
    }
});
exports.editQuestion = editQuestion;
// Edit an answer
const editAnswer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    const { Answer } = req.body;
    // Validate input
    if (!QandA_id || !Answer) {
        return res.status(400).json({ message: 'QandA_id and Answer are required' });
    }
    try {
        const lastUpdated = new Date();
        const [update] = yield db_config_1.default.execute('UPDATE QandA SET Answer = ?, lastUpdated = ? WHERE QandA_id = ?', [Answer, lastUpdated, QandA_id]);
        if (update.affectedRows === 0) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        res.status(200).json({ message: 'Answer updated successfully' });
    }
    catch (error) {
        console.error('Error editing answer:', error);
        res.status(500).json({ message: 'Error editing answer', error: error.message });
    }
});
exports.editAnswer = editAnswer;
// Get an answer by QandA_id
const getAnswerByQandAId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.QandA_id);
    // Validate input
    if (isNaN(QandA_id)) {
        return res.status(400).json({ message: 'Invalid QandA_id' });
    }
    try {
        const [result] = yield db_config_1.default.execute('SELECT Answer FROM QandA WHERE QandA_id = ?', [QandA_id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No answer found for the given QandA_id' });
        }
        res.status(200).json(result[0]); // Return the answer found
    }
    catch (error) {
        console.error('Error retrieving answer:', error);
        res.status(500).json({ message: 'Error retrieving answer', error: error.message });
    }
});
exports.getAnswerByQandAId = getAnswerByQandAId;
// Get all questions by schoolGroup_id
const getQuestionsBySchoolGroupId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);
    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }
    try {
        const [result] = yield db_config_1.default.execute('SELECT * FROM QandA WHERE schoolGroup_id = ?', [schoolGroup_id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'No questions found for the given schoolGroup_id' });
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Error retrieving questions:', error);
        res.status(500).json({ message: 'Error retrieving questions', error: error.message });
    }
});
exports.getQuestionsBySchoolGroupId = getQuestionsBySchoolGroupId;
// Function to delete a PDF by schoolGroup_id
const deletePDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolGroup_id = parseInt(req.params.schoolGroup_id);
    // Validate input
    if (isNaN(schoolGroup_id)) {
        return res.status(400).json({ message: 'Invalid schoolGroup_id' });
    }
    try {
        // Check if a PDF exists for the given schoolGroup_id
        const [rows] = yield db_config_1.default.execute('SELECT * FROM resourcelibrary WHERE schoolGroup_id = ?', [schoolGroup_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No PDF found for the given schoolGroup_id' });
        }
        // Delete the PDF entry from the database
        const [result] = yield db_config_1.default.execute('DELETE FROM resourcelibrary WHERE schoolGroup_id = ?', [schoolGroup_id]);
        res.status(200).json({ message: 'PDF deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting PDF:', error);
        res.status(500).json({ message: 'Error deleting PDF', error: error.message });
    }
});
exports.deletePDF = deletePDF;
const editQA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const QandA_id = parseInt(req.params.id); // Get the QandA ID from the URL
    const { Question = null, // Optional field, set to null if not provided
    Answer = null, // Optional field, set to null if not provided
     } = req.body;
    // Check if the QandA ID is valid
    if (isNaN(QandA_id)) {
        return res.status(400).json({ message: 'Invalid QandA ID' });
    }
    // Validate input for at least one field being present
    if (!Question && !Answer) {
        return res.status(400).json({ message: 'At least one of Question or Answer must be provided' });
    }
    try {
        const lastUpdated = new Date().toISOString(); // Convert date to string format
        // Build the update query dynamically based on provided fields
        const fieldsToUpdate = [];
        const values = [];
        if (Question) {
            fieldsToUpdate.push('Question = ?');
            values.push(Question);
        }
        if (Answer) {
            fieldsToUpdate.push('Answer = ?, isAnswered = 1'); // Mark as answered if answer is provided
            values.push(Answer);
        }
        // Add lastUpdated field
        fieldsToUpdate.push('lastUpdated = ?');
        values.push(lastUpdated); // Add the formatted date string to values
        // Combine fields for the SQL query
        const query = `UPDATE QandA SET ${fieldsToUpdate.join(', ')} WHERE QandA_id = ?`;
        values.push(QandA_id.toString()); // Convert QandA_id to string format for the query
        // Execute the update query
        const [result] = yield db_config_1.default.execute(query, values);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ message: 'Question and answer updated successfully' });
    }
    catch (error) {
        console.error('Error updating question and answer:', error);
        res.status(500).json({ message: 'Error updating question and answer', error: error.message });
    }
});
exports.editQA = editQA;
