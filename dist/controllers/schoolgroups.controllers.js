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
exports.getAllSchoolGroups = exports.editSchoolGroup = exports.deleteSchoolGroup = exports.addSchoolGroup = void 0;
const db_config_1 = __importDefault(require("../../config/db.config"));
// Adding a group to the table
const addSchoolGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { schoolname } = req.body;
    if (!schoolname) {
        return res.status(400).json({ message: 'School name is required' });
    }
    const newGroup = {
        schoolgroup_id: 0,
        name: schoolname
    };
    try {
        const [result] = yield db_config_1.default.execute('INSERT into SchoolGroup (school_group_id, name) VALUES (?, ?)', [
            newGroup.schoolgroup_id,
            newGroup.name
        ]);
        res.status(201).json({ message: 'Group created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding group', error });
    }
});
exports.addSchoolGroup = addSchoolGroup;
// Delete group
const deleteSchoolGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const School_ID = parseInt(req.params.id);
    // Checks for if group_id is valid/exists
    if (!School_ID) {
        return res.status(400).json({ message: 'Group is required' });
    }
    try {
        const [check] = yield db_config_1.default.execute('SELECT * FROM SchoolGroup WHERE school_group_id = ?', [School_ID]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Group does not exist' });
        }
        // Deleting group entry from table
        yield db_config_1.default.execute('DELETE FROM SchoolGroup WHERE school_group_id = ?', [School_ID]);
        res.status(200).json({ message: 'Group deleted' });
    }
    catch (err) {
        res.status(401).json({ message: 'Group error deleting' });
    }
});
exports.deleteSchoolGroup = deleteSchoolGroup;
// Edit group
const editSchoolGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const School_ID = parseInt(req.params.id);
    // Checks for if group_id is valid/exists
    if (!School_ID) {
        return res.status(400).json({ message: 'Group is required' });
    }
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'name required' });
    }
    try {
        const [update] = yield db_config_1.default.execute('UPDATE SchoolGroup SET name = ? WHERE school_group_id = ?', [name, School_ID]);
        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Schoolgroup id not found' });
            }
        }
        res.status(200).json({ message: 'School group updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error editing SchoolGroup ' });
    }
});
exports.editSchoolGroup = editSchoolGroup;
// Get all groups
const getAllSchoolGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_config_1.default.execute('SELECT * FROM SchoolGroup');
        res.status(200).json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving groups', error });
    }
});
exports.getAllSchoolGroups = getAllSchoolGroups;
