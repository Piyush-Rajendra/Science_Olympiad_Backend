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
exports.getTeamTimeBlocksByTimeBlockIdDetailed = exports.getUniqueIdByTeamTimeBlockId = exports.getTeamTimeBlockWithSchoolById = exports.updateAttendStatus = exports.getAttendStatus = exports.updateTeamTimeBlockComment = exports.getTeamTimeBlockComment = exports.getTeamTimeBlocksByEventId = exports.getTeamTimeBlocksByTimeBlockId = exports.getTeamTimeBlocksByTeamId = exports.getTeamTimeBlockById = exports.deleteTeamTimeBlock = exports.editTeamTimeBlock = exports.addTeamTimeBlock = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const addTeamTimeBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeBlock_id, team_id, event_id, attend, comment, tier, score } = req.body;
    // Validate required fields
    if (!timeBlock_id || !team_id || !event_id || attend === undefined) {
        return res.status(400).json({ message: 'TimeBlock ID, Team ID, Event ID, and Attend status are required' });
    }
    // Create the new team time block object
    const newTeamTimeBlock = {
        teamTimeBlock_id: 0, // Auto-increment handled by the database
        timeBlock_id,
        team_id,
        event_id,
        attend,
        comment: comment || '', // Default to empty string if comment is not provided
        tier: tier || 0, // Default tier to 0 if not provided
        score: score || null, // Default score to 0 if not provided
    };
    try {
        const [result] = yield db_config_1.default.execute(`INSERT INTO TeamTimeBlock (TimeBlock_ID, Team_ID, Event_ID, Attend, Comment, Tier, Score) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            newTeamTimeBlock.timeBlock_id,
            newTeamTimeBlock.team_id,
            newTeamTimeBlock.event_id,
            newTeamTimeBlock.attend,
            newTeamTimeBlock.comment,
            newTeamTimeBlock.tier,
            newTeamTimeBlock.score,
        ]);
        // Return a success message along with the newly created team time block ID
        res.status(201).json({ message: 'Team time block added successfully' });
    }
    catch (error) {
        console.error('Error adding team time block:', error);
        res.status(500).json({ message: 'Error adding team time block', error: error.message });
    }
});
exports.addTeamTimeBlock = addTeamTimeBlock;
const editTeamTimeBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamTimeBlockId = parseInt(req.params.id); // Get the team time block ID from the URL
    const { timeBlock_id, team_id, event_id, attend, comment, tier, score } = req.body;
    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }
    // Validate required fields
    if (!timeBlock_id || !team_id || !event_id || attend === undefined) {
        return res.status(400).json({ message: 'TimeBlock ID, Team ID, Event ID, and Attend status are required' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`UPDATE TeamTimeBlock 
             SET TimeBlock_ID = ?, Team_ID = ?, Event_ID = ?, Attend = ?, Comment = ?, Tier = ?, Score = ?
             WHERE TeamTimeBlock_ID = ?`, [
            timeBlock_id,
            team_id,
            event_id,
            attend,
            comment || '', // Default to empty string if comment is not provided
            tier || 1, // Default tier to 1 if not provided
            score !== undefined ? score : null, // Use score directly if it's defined, else default to null
            teamTimeBlockId, // Use the team time block ID from the URL
        ]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }
        res.status(200).json({ message: 'Team time block updated successfully' });
    }
    catch (error) {
        console.error('Error updating team time block:', error);
        res.status(500).json({ message: 'Error updating team time block', error: error.message });
    }
});
exports.editTeamTimeBlock = editTeamTimeBlock;
const deleteTeamTimeBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamTimeBlockId = parseInt(req.params.id); // Get team time block ID from the URL
    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }
    try {
        // Execute the delete query
        const [result] = yield db_config_1.default.execute('DELETE FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?', [teamTimeBlockId]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }
        res.status(200).json({ message: 'Team time block deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting team time block:', error);
        res.status(500).json({ message: 'Error deleting team time block', error: error.message });
    }
});
exports.deleteTeamTimeBlock = deleteTeamTimeBlock;
const getTeamTimeBlockById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamTimeBlockId = parseInt(req.params.id); // Get team time block ID from the URL
    if (isNaN(teamTimeBlockId)) {
        return res.status(400).json({ message: 'Invalid team time block ID' });
    }
    try {
        // Execute the select query
        const [rows] = yield db_config_1.default.execute('SELECT * FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?', [teamTimeBlockId]);
        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'Team time block not found' });
        }
        // Return the found team time block
        res.status(200).json(rows[0]); // Return the first (and should be only) result
    }
    catch (error) {
        console.error('Error retrieving team time block:', error);
        res.status(500).json({ message: 'Error retrieving team time block', error: error.message });
    }
});
exports.getTeamTimeBlockById = getTeamTimeBlockById;
const getTeamTimeBlocksByTeamId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamId = parseInt(req.params.teamId); // Get team ID from the URL
    if (isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID' });
    }
    try {
        // Execute the select query
        const [rows] = yield db_config_1.default.execute('SELECT * FROM TeamTimeBlock WHERE Team_ID = ?', [teamId]);
        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this team' });
        }
        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    }
    catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
});
exports.getTeamTimeBlocksByTeamId = getTeamTimeBlocksByTeamId;
const getTeamTimeBlocksByTimeBlockId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timeBlockId = parseInt(req.params.timeBlockId); // Get time block ID from the URL
    if (isNaN(timeBlockId)) {
        return res.status(400).json({ message: 'Invalid time block ID' });
    }
    try {
        // Execute the select query
        const [rows] = yield db_config_1.default.execute('SELECT * FROM TeamTimeBlock WHERE TimeBlock_ID = ?', [timeBlockId]);
        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this time block ID' });
        }
        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    }
    catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
});
exports.getTeamTimeBlocksByTimeBlockId = getTeamTimeBlocksByTimeBlockId;
const getTeamTimeBlocksByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = parseInt(req.params.eventId); // Get event ID from the URL
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        // Execute the select query
        const [rows] = yield db_config_1.default.execute('SELECT * FROM TeamTimeBlock WHERE Event_ID = ?', [eventId]);
        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No time blocks found for this event ID' });
        }
        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    }
    catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
});
exports.getTeamTimeBlocksByEventId = getTeamTimeBlocksByEventId;
const getTeamTimeBlockComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { TeamTimeBlock_ID } = req.params;
    try {
        // Query to get the comment by TeamTimeBlock_ID
        const [rows] = yield db_config_1.default.execute(`
            SELECT Comment FROM TeamTimeBlock WHERE TeamTimeBlock_ID = ?
        `, [TeamTimeBlock_ID]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'TeamTimeBlock not found' });
            return;
        }
        // Send the comment as JSON
        res.json({ comment: rows[0].Comment });
    }
    catch (error) {
        console.error('Error retrieving comment:', error);
        res.status(500).json({ message: 'Error retrieving comment' });
    }
});
exports.getTeamTimeBlockComment = getTeamTimeBlockComment;
// Update the comment for a specific TeamTimeBlock by its ID
const updateTeamTimeBlockComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { TeamTimeBlock_ID } = req.params;
    const { comment } = req.body; // Expect the new comment from the request body
    if (typeof comment !== 'string') {
        res.status(400).json({ message: 'Invalid comment format' });
        return;
    }
    try {
        // Query to update the comment by TeamTimeBlock_ID
        const [result] = yield db_config_1.default.execute(`
            UPDATE TeamTimeBlock SET Comment = ? WHERE TeamTimeBlock_ID = ?
        `, [comment, TeamTimeBlock_ID]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'TeamTimeBlock not found' });
            return;
        }
        res.json({ message: 'Comment updated successfully' });
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
});
exports.updateTeamTimeBlockComment = updateTeamTimeBlockComment;
const getAttendStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamTimeBlockId } = req.params;
        // SQL query to get the Attend value
        const [rows] = yield db_config_1.default.execute(`SELECT Attend 
             FROM TeamTimeBlock 
             WHERE TeamTimeBlock_ID = ?`, [teamTimeBlockId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'TeamTimeBlock not found' });
        }
        const attend = rows[0].Attend;
        res.json({ attend });
    }
    catch (error) {
        console.error('Error getting Attend status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAttendStatus = getAttendStatus;
const updateAttendStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { teamTimeBlockId } = req.params;
        const { attend } = req.body; // Make sure the client sends a boolean value for attend
        // Validate the input (attend must be a boolean)
        if (typeof attend !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for Attend. Must be a boolean.' });
        }
        // Determine the Tier based on Attend value
        const tier = attend ? 1 : 4;
        // SQL query to update the Attend and Tier values
        const [result] = yield db_config_1.default.execute(`UPDATE TeamTimeBlock 
             SET Attend = ?, Tier = ? 
             WHERE TeamTimeBlock_ID = ?`, [attend, tier, teamTimeBlockId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'TeamTimeBlock not found' });
        }
        res.json({ message: 'Attend status and Tier updated successfully' });
    }
    catch (error) {
        console.error('Error updating Attend status and Tier:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateAttendStatus = updateAttendStatus;
const getTeamTimeBlockWithSchoolById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [rows] = yield db_config_1.default.execute(`
        SELECT School.name AS schoolName
        FROM TeamTimeBlock
        JOIN Team ON TeamTimeBlock.Team_ID = Team.team_id
        JOIN School ON Team.school_id = School.ID
        WHERE TeamTimeBlock.TeamTimeBlock_ID = ?
      `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Team TimeBlock not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching school name by Team TimeBlock ID', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTeamTimeBlockWithSchoolById = getTeamTimeBlockWithSchoolById;
const getUniqueIdByTeamTimeBlockId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [rows] = yield db_config_1.default.execute(`
        SELECT Team.unique_id
        FROM TeamTimeBlock
        JOIN Team ON TeamTimeBlock.Team_ID = Team.team_id
        WHERE TeamTimeBlock.TeamTimeBlock_ID = ?
      `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Team TimeBlock not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Error fetching unique ID by Team TimeBlock ID', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUniqueIdByTeamTimeBlockId = getUniqueIdByTeamTimeBlockId;
const getTeamTimeBlocksByTimeBlockIdDetailed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const timeBlockId = parseInt(req.params.id); // Get TimeBlock ID from the URL
    if (isNaN(timeBlockId)) {
        return res.status(400).json({ message: 'Invalid time block ID' });
    }
    try {
        // Execute the select query
        const [rows] = yield db_config_1.default.execute(`
            SELECT 
                tt.TeamTimeBlock_ID,
                tt.Attend,
                tt.Comment,
                tt.Tier,
                tt.Score,
                t.name AS team_name,
                s.flight
            FROM 
                TeamTimeBlock tt
            JOIN 
                Team t ON tt.Team_ID = t.team_id
            JOIN 
                School s ON t.school_id = s.ID
            WHERE 
                tt.TimeBlock_ID = ?
            `, [timeBlockId]);
        // Check if any rows were returned
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(404).json({ message: 'No team time blocks found for this time block' });
        }
        // Return the found team time blocks
        res.status(200).json(rows); // Return all found results
    }
    catch (error) {
        console.error('Error retrieving team time blocks:', error);
        res.status(500).json({ message: 'Error retrieving team time blocks', error: error.message });
    }
});
exports.getTeamTimeBlocksByTimeBlockIdDetailed = getTeamTimeBlocksByTimeBlockIdDetailed;
