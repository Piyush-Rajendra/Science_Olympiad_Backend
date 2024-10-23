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
exports.getSchoolsByTournamentId = exports.getSchoolById = exports.deleteSchool = exports.getAllSchools = exports.editSchool = exports.addSchool = void 0;
const db_config_1 = __importDefault(require("../../config/db.config"));
const addSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { school_group_id, name, flight, tournament_id } = req.body;
    // Validate required fields
    if (!name || !flight) {
        return res.status(400).json({ message: 'Name and flight are required' });
    }
    // Create the new school object
    const newSchool = {
        ID: 0, // Auto-increment handled by the database
        school_group_id,
        name,
        flight,
        tournament_id
    };
    try {
        const [result] = yield db_config_1.default.execute('INSERT INTO School (school_group_id, name, flight, tournament_id) VALUES (?, ?, ?, ?)', [
            newSchool.school_group_id,
            newSchool.name,
            newSchool.flight,
            newSchool.tournament_id,
        ]);
        // Return success message
        res.status(201).json({ message: 'School added successfully' });
    }
    catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ message: 'Error adding school', error: error.message });
    }
});
exports.addSchool = addSchool;
const editSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const school_id = parseInt(req.params.id); // Get the school ID from the URL
    const { school_group_id = null, // Optional field, set to null if not provided
    name = null, // Optional field, set to null if not provided
    flight = null, tournament_id = null, // Optional field, set to null if not provided
     } = req.body;
    // Check if the school ID is valid
    if (isNaN(school_id)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`UPDATE School 
             SET school_group_id = ?, name = ?, flight = ?, tournament_id = ?
             WHERE ID = ?`, [
            school_group_id, // Can be null if not provided
            name, // Can be null if not provided
            flight,
            tournament_id, // Can be null if not provided
            school_id, // Use the school ID from the URL
        ]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json({ message: 'School updated successfully' });
    }
    catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ message: 'Error updating school', error: error.message });
    }
});
exports.editSchool = editSchool;
const getAllSchools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [schools] = yield db_config_1.default.execute('SELECT * FROM School');
        res.status(200).json(schools);
    }
    catch (error) {
        console.error('Error retrieving schools:', error);
        res.status(500).json({ message: 'Error retrieving schools', error: error.message });
    }
});
exports.getAllSchools = getAllSchools;
const deleteSchool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolId = parseInt(req.params.id); // Get school ID from the URL
    if (isNaN(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }
    try {
        // Execute the delete query
        const [result] = yield db_config_1.default.execute('DELETE FROM School WHERE ID = ?', [schoolId]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json({ message: 'School deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ message: 'Error deleting school', error: error.message });
    }
});
exports.deleteSchool = deleteSchool;
const getSchoolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schoolId = parseInt(req.params.id); // Get school ID from the URL
    if (isNaN(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID' });
    }
    try {
        // Execute the select query
        const [schools] = yield db_config_1.default.execute('SELECT * FROM School WHERE ID = ?', [schoolId]);
        // Check if the school was found
        if (schools.length === 0) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.status(200).json(schools[0]); // Return the first (and should be only) school found
    }
    catch (error) {
        console.error('Error retrieving school:', error);
        res.status(500).json({ message: 'Error retrieving school', error: error.message });
    }
});
exports.getSchoolById = getSchoolById;
const getSchoolsByTournamentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament_id = parseInt(req.params.tournamentId); // Get tournament ID from the URL
    // Validate tournament ID
    if (isNaN(tournament_id)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }
    try {
        // Execute the query to retrieve schools by tournament ID
        const [schools] = yield db_config_1.default.execute('SELECT * FROM School WHERE tournament_id = ?', [tournament_id]);
        // Check if schools is an empty array
        if (schools.length === 0) {
            return res.status(404).json({ message: 'No schools found for this tournament ID' });
        }
        // Return the schools
        res.status(200).json(schools);
    }
    catch (error) {
        console.error('Error retrieving schools by tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving schools', error: error.message });
    }
});
exports.getSchoolsByTournamentId = getSchoolsByTournamentId;
