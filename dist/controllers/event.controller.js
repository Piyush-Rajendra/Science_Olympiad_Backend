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
exports.checkAndUpdateEventStatus = exports.getEventsByTournamentAndSupervisor = exports.finalizeEventByEventId = exports.getScorePercentageByEventId = exports.getEventStatusByEventId = exports.getTotalAbsentByEvent = exports.getEventsBySupervisorAndTournamentId = exports.updateEventStatus = exports.getEventStatus = exports.getEventSupervisorEventById = exports.updateEventForEventSupervisor = exports.removeEventFromEventSupervisor = exports.getEventsByEventSupervisor = exports.getEventSupervisorIdByEmail = exports.addEventToEventSupervisor = exports.getEventById = exports.deleteEvent = exports.getEventsByEventSupervisorId = exports.getEventsByTournamentId = exports.getAllEvents = exports.editEvent = exports.addEvent = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const addEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, tournament_id, scoringAlg, description, status, scoreStatus } = req.body;
    // Validate required fields
    if (!name || !tournament_id || !scoringAlg) {
        return res.status(400).json({ message: 'Tournament ID, event name, and scoring algorithm are required' });
    }
    // Create the new event object
    const newEvent = {
        event_id: 0, // Auto-increment handled by the database
        name,
        tournament_id,
        scoringAlg,
        description: description || "", // Use provided description or default to empty string
        status,
        scoreStatus,
    };
    try {
        const [result] = yield db_config_1.default.execute('INSERT INTO Event (name, tournament_id, scoringAlg, description, status, scoreStatus) VALUES (?, ?, ?, ?, ?, ?)', [
            newEvent.name,
            newEvent.tournament_id,
            newEvent.scoringAlg,
            newEvent.description,
            newEvent.status,
            newEvent.scoreStatus,
        ]);
        // Return the newly created event ID
        res.status(201).json({ message: 'Event added successfully' });
    }
    catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Error adding event', error: error.message });
    }
});
exports.addEvent = addEvent;
// Edit Event by ID
const editEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event_id = parseInt(req.params.id); // Get the event ID from the URL
    const { name, tournament_id, scoringAlg = null, // Optional field, set to null if not provided
    description = null, // Optional field, set to null if not provided
    status = null, scoreStatus = null, } = req.body;
    try {
        const [result] = yield db_config_1.default.execute(`UPDATE Event 
             SET name = ?, tournament_id = ?, scoringAlg = ?, description = ?, status = ?, scoreStatus = ?
             WHERE event_id = ?`, [
            name,
            tournament_id, // Required
            scoringAlg, // This can be null if not provided
            description, // This can be null if not provided
            status,
            scoreStatus, // The scoreStatus field
            event_id // This should come last in the array
        ]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event updated successfully' });
    }
    catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event', error: error.message });
    }
});
exports.editEvent = editEvent;
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event');
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getAllEvents = getAllEvents;
// Get Events by Tournament ID
const getEventsByTournamentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournament_id = parseInt(req.params.tournamentId); // Get tournament ID from the URL
    if (isNaN(tournament_id)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }
    try {
        // Assuming pool.execute returns a result set array where the first element is the data
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE tournament_id = ?', [tournament_id]);
        // Check if events is an empty array
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this tournament ID' });
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events by tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getEventsByTournamentId = getEventsByTournamentId;
const getEventsByEventSupervisorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventSupervisorId = parseInt(req.params.supervisorId); // Get tournament ID from the URL
    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }
    try {
        // Assuming pool.execute returns a result set array where the first element is the data
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE tournament_id = ?', [eventSupervisorId]);
        // Check if events is an empty array
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this supervisor ID' });
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events by supervisor ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getEventsByEventSupervisorId = getEventsByEventSupervisorId;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = parseInt(req.params.id); // Get event ID from the URL
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        // Execute the delete query
        const [result] = yield db_config_1.default.execute('DELETE FROM Event WHERE event_id = ?', [eventId]);
        // Check if any rows were affected
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});
exports.deleteEvent = deleteEvent;
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = parseInt(req.params.id); // Get tournament ID from the URL
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        // Execute the select query
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE event_id = ?', [eventId]);
        // Check if the school was found
        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(events[0]); // Return the first (and should be only) event found
    }
    catch (error) {
        console.error('Error retrieving event:', error);
        res.status(500).json({ message: 'Error retrieving event', error: error.message });
    }
});
exports.getEventById = getEventById;
const addEventToEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { event_id, eventSupervisor_id } = req.body;
    if (!event_id || !eventSupervisor_id) {
        return res.status(400).json({ message: 'No such Event Supervisor exist or event exist.' });
    }
    const newEventToEventSupervisor = {
        eventSuperVisorEvent_id: 0,
        event_id,
        eventSupervisor_id,
    };
    try {
        const [result] = yield db_config_1.default.execute('INSERT INTO EventSuperVisorEvent (event_id, eventSupervisor_id) VALUES (?, ?)', [
            newEventToEventSupervisor.event_id,
            newEventToEventSupervisor.eventSupervisor_id,
        ]);
        res.status(201).json({ message: 'Event added successfully' });
    }
    catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Error adding event', error: error.message });
    }
});
exports.addEventToEventSupervisor = addEventToEventSupervisor;
const getEventSupervisorIdByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query; // Get the email from query params
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    try {
        // Query the database to get the eventSupervisor_id by email
        const [rows] = yield db_config_1.default.execute('SELECT eventSupervisor_id FROM eventsupervisor WHERE email = ?', [email]);
        ;
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event Supervisor not found' });
        }
        // Send back the eventSupervisor_id
        const eventSupervisor_id = rows[0].eventSupervisor_id;
        res.status(200).json({ eventSupervisor_id });
    }
    catch (error) {
        console.error('Error retrieving eventSupervisor:', error);
        res.status(500).json({ message: 'Error retrieving event supervisor', error });
    }
});
exports.getEventSupervisorIdByEmail = getEventSupervisorIdByEmail;
const getEventsByEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventSupervisorId = parseInt(req.params.id);
    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }
    try {
        const [events] = yield db_config_1.default.execute('SELECT * FROM EventSuperVisorEvent WHERE eventSupervisor_id = ?', [eventSupervisorId]);
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this event supervisor' });
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getEventsByEventSupervisor = getEventsByEventSupervisor;
const removeEventFromEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { event_id, eventSupervisor_id } = req.body;
    if (!event_id || !eventSupervisor_id) {
        return res.status(400).json({ message: 'Missing event ID or event supervisor ID' });
    }
    try {
        const [result] = yield db_config_1.default.execute('DELETE FROM EventSuperVisorEvent WHERE event_id = ? AND eventSupervisor_id = ?', [event_id, eventSupervisor_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No such event-supervisor relation found' });
        }
        res.status(200).json({ message: 'Event removed from event supervisor successfully' });
    }
    catch (error) {
        console.error('Error removing event from event supervisor:', error);
        res.status(500).json({ message: 'Error removing event', error: error.message });
    }
});
exports.removeEventFromEventSupervisor = removeEventFromEventSupervisor;
const updateEventForEventSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventSuperVisorEvent_id, event_id, eventSupervisor_id } = req.body;
    if (!eventSuperVisorEvent_id || !event_id || !eventSupervisor_id) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const [result] = yield db_config_1.default.execute('UPDATE EventSuperVisorEvent SET event_id = ?, eventSupervisor_id = ? WHERE eventSuperVisorEvent_id = ?', [event_id, eventSupervisor_id, eventSuperVisorEvent_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'EventSupervisorEvent not found or no update made' });
        }
        res.status(200).json({ message: 'EventSupervisorEvent updated successfully' });
    }
    catch (error) {
        console.error('Error updating event-supervisor relation:', error);
        res.status(500).json({ message: 'Error updating event-supervisor relation', error: error.message });
    }
});
exports.updateEventForEventSupervisor = updateEventForEventSupervisor;
const getEventSupervisorEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventSuperVisorEventId = parseInt(req.params.id);
    if (isNaN(eventSuperVisorEventId)) {
        return res.status(400).json({ message: 'Invalid event-supervisor event ID' });
    }
    try {
        const [eventSupervisorEvent] = yield db_config_1.default.execute('SELECT * FROM EventSuperVisorEvent WHERE eventSuperVisorEvent_id = ?', [eventSuperVisorEventId]);
        if (eventSupervisorEvent.length === 0) {
            return res.status(404).json({ message: 'Event supervisor event not found' });
        }
        res.status(200).json(eventSupervisorEvent[0]);
    }
    catch (error) {
        console.error('Error retrieving event-supervisor event:', error);
        res.status(500).json({ message: 'Error retrieving event-supervisor event', error: error.message });
    }
});
exports.getEventSupervisorEventById = getEventSupervisorEventById;
const getEventStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { event_id } = req.params;
    try {
        const [rows] = yield db_config_1.default.execute(`
          SELECT status FROM Event WHERE event_id = ?
      `, [event_id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ status: rows[0].status });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving event status' });
    }
});
exports.getEventStatus = getEventStatus;
const updateEventStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { event_id } = req.params;
    const { status } = req.body;
    if (typeof status !== 'number') {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`
          UPDATE Event SET status = ? WHERE event_id = ?
      `, [status, event_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event status updated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating event status' });
    }
});
exports.updateEventStatus = updateEventStatus;
const getEventsBySupervisorAndTournamentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventSupervisorId = parseInt(req.params.supervisorId); // Get event supervisor ID from the URL
    const tournamentId = parseInt(req.params.tournamentId); // Get tournament ID from the URL
    // Validate the inputs
    if (isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid event supervisor ID' });
    }
    if (isNaN(tournamentId)) {
        return res.status(400).json({ message: 'Invalid tournament ID' });
    }
    try {
        // SQL query to find events based on both supervisor ID and tournament ID
        const [events] = yield db_config_1.default.execute('SELECT * FROM Event WHERE eventSupervisor_id = ? AND tournament_id = ?', [eventSupervisorId, tournamentId]);
        // Check if any events were found
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this supervisor ID and tournament ID' });
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events by supervisor ID and tournament ID:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getEventsBySupervisorAndTournamentId = getEventsBySupervisorAndTournamentId;
const getTotalAbsentByEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { eventId } = req.params;
        // SQL query to get the count of team time blocks where Attend is false
        const [rows] = yield db_config_1.default.execute(`SELECT COUNT(*) as count 
             FROM TeamTimeBlock 
             WHERE event_id = ? AND Attend = false`, [eventId]);
        // Send the count back in the response
        const count = ((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
        res.json({ count });
    }
    catch (error) {
        console.error('Error getting absent team count:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getTotalAbsentByEvent = getTotalAbsentByEvent;
const getEventStatusByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`SELECT
                CASE
                    WHEN e.scoreStatus = 3 THEN 'Completed'  -- Check if event scoreStatus is 3
                    WHEN COUNT(ttb.TeamTimeBlock_ID) = 0 THEN 'Not Available'
                    WHEN SUM(CASE WHEN ttb.Score IS NULL THEN 1 ELSE 0 END) = COUNT(ttb.TeamTimeBlock_ID) THEN 'Not Started'
                    WHEN SUM(CASE WHEN ttb.Score IS NOT NULL THEN 1 ELSE 0 END) > 0 
                         AND SUM(CASE WHEN ttb.Score IS NULL THEN 1 ELSE 0 END) > 0 THEN 'In Progress'
                    ELSE 'For Review'
                END AS scoreStatus
            FROM Event e
            LEFT JOIN TeamTimeBlock ttb ON e.event_id = ttb.Event_ID
            WHERE e.event_id = ? AND ttb.Attend = 1`, // Include only present teams
        [eventId]);
        const status = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.scoreStatus) || 'Not Available';
        res.status(200).json({ status });
    }
    catch (error) {
        console.error('Error retrieving event status:', error);
        res.status(500).json({ message: 'Error retrieving event status', error: error.message });
    }
});
exports.getEventStatusByEventId = getEventStatusByEventId;
const getScorePercentageByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`SELECT
                COUNT(CASE WHEN Score IS NOT NULL THEN 1 END) AS nonNullScoreCount,
                COUNT(*) AS totalScoreCount
            FROM TeamTimeBlock
            WHERE Event_ID = ? AND Attend = 1`, // Only include teams that are present
        [eventId]);
        const nonNullScoreCount = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.nonNullScoreCount) || 0;
        const totalScoreCount = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalScoreCount) || 0;
        let scorePercentage;
        if (totalScoreCount === 0) {
            scorePercentage = 0; // If no present scores exist
        }
        else if (nonNullScoreCount === totalScoreCount) {
            scorePercentage = 100; // All present scores are non-null
        }
        else {
            scorePercentage = (nonNullScoreCount / totalScoreCount) * 100; // Calculate percentage of non-null scores
        }
        res.status(200).json({ scorePercentage });
    }
    catch (error) {
        console.error('Error retrieving non-null score count:', error);
        res.status(500).json({ message: 'Error retrieving non-null score count', error: error.message });
    }
});
exports.getScorePercentageByEventId = getScorePercentageByEventId;
const finalizeEventByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
    }
    try {
        // Execute the update query
        const [result] = yield db_config_1.default.execute(`UPDATE Event
             SET scoreStatus = 3
             WHERE event_id = ?`, [eventId]);
        // Access the affectedRows from the result object
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event finalized successfully' });
    }
    catch (error) {
        console.error('Error finalizing event:', error);
        res.status(500).json({ message: 'Error finalizing event', error: error.message });
    }
});
exports.finalizeEventByEventId = finalizeEventByEventId;
const getEventsByTournamentAndSupervisor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tournamentId = parseInt(req.params.tournamentId);
    const eventSupervisorId = parseInt(req.params.eventSupervisorId);
    if (isNaN(tournamentId) || isNaN(eventSupervisorId)) {
        return res.status(400).json({ message: 'Invalid tournament or event supervisor ID' });
    }
    try {
        // Execute the select query
        const [events] = yield db_config_1.default.execute(`SELECT E.event_id, E.name, E.scoringAlg, E.description, E.status, E.scoreStatus
            FROM Event E
            JOIN EventSuperVisorEvent ES ON E.event_id = ES.event_id
            JOIN Tournament T ON E.tournament_id = T.tournament_id
            WHERE T.tournament_id = ? AND ES.eventSupervisor_id = ?`, [tournamentId, eventSupervisorId]);
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found' });
        }
        res.status(200).json(events);
    }
    catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
});
exports.getEventsByTournamentAndSupervisor = getEventsByTournamentAndSupervisor;
const checkAndUpdateEventStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId } = req.params;
    try {
        // Get all TimeBlock statuses for the given event
        const [timeBlocks] = yield db_config_1.default.execute(`SELECT Status FROM TimeBlock WHERE Event_ID = ?`, [eventId]);
        if (!timeBlocks.length) {
            return res.status(404).json({ message: 'No time blocks found for this event' });
        }
        const allStatuses = timeBlocks.map((block) => block.Status);
        // Logic for updating event status based on TimeBlock statuses
        let newEventStatus;
        if (allStatuses.every((status) => status === 0)) {
            newEventStatus = 0;
        }
        else if (allStatuses.every((status) => status === 2)) {
            newEventStatus = 2;
        }
        else if (allStatuses.some((status) => status >= 1)) {
            newEventStatus = 1;
        }
        else {
            return res.status(400).json({ message: 'Invalid status combination' });
        }
        // Update the Event status
        yield db_config_1.default.execute(`UPDATE Event SET Status = ? WHERE event_id = ?`, [newEventStatus, eventId]);
        res.status(200).json({ message: 'Event status updated successfully', newEventStatus });
    }
    catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.checkAndUpdateEventStatus = checkAndUpdateEventStatus;
