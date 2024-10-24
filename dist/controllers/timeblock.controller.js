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
exports.updateTimeBlockStatus = exports.getTimeBlockStatus = exports.getTimeblocksByTournamentId = exports.getTimeblocksByEventId = exports.deleteTimeblock = exports.editTimeblock = exports.addTimeblocks = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
// Add multiple timeblocks (based on how many timeblocks and breaks between)
const addTimeblocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startTime, event_id, tournament_id, building, roomNumber, status, duration, breakTime, amount } = req.body;
    /*
    console.log("Start time: ", startTime);
    console.log("Event_id: ", event_id);
    console.log("Tournament_id: ", tournament_id);
    console.log("Building: ", building);
    console.log("Room Number: ", roomNumber);
    console.log("Status: ", status);
    console.log("Duration: ", duration);
    console.log("Break Time: ", breakTime);
    console.log("Amount: ", amount);*/
    if (!startTime || !event_id || !tournament_id || !building || !roomNumber || !duration || !breakTime || !amount) {
        return res.status(400).json({ message: 'Missing information to add timeblock' });
    }
    try {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const durationMs = duration * 60 * 1000;
        const breakTimeMs = breakTime * 60 * 1000;
        const date = new Date();
        date.setHours(startHour, startMinute, 0, 0);
        const startInTime = date.getTime();
        for (let i = 0; i < amount; i++) {
            const newStart = new Date(startInTime + (i * durationMs) + (i * breakTimeMs));
            const newEnd = new Date(newStart.getTime() + (durationMs));
            const newTimeblock = {
                timeBlock_id: 0,
                startTime: newStart,
                endTime: newEnd,
                event_id: event_id,
                tournament_id: tournament_id,
                building: building,
                roomNumber: roomNumber,
                status: status
            };
            yield db_config_1.default.execute('INSERT INTO TimeBlock (TimeBlock_ID, Event_ID, Tournament_ID, TimeBegin, TimeEnd, Building, RoomNumber, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                newTimeblock.timeBlock_id,
                newTimeblock.event_id,
                newTimeblock.tournament_id,
                newTimeblock.startTime,
                newTimeblock.endTime,
                newTimeblock.building,
                newTimeblock.roomNumber,
                newTimeblock.status
            ]);
        }
        res.status(201).json({ message: 'Timeblock created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding timeblocks', error });
    }
});
exports.addTimeblocks = addTimeblocks;
// Edit timeblock
const editTimeblock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { startTime, endTime, event_id, tournament_id, building, roomNumber, status } = req.body;
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id' });
    }
    try {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(startHour, startMinute, 0, 0);
        //const startInTime = startDate.getTime()
        const endDate = new Date();
        endDate.setHours(endHour, endMinute, 0, 0);
        //const endInTime = endDate.getTime()
        const [update] = yield db_config_1.default.execute('UPDATE TimeBlock SET TimeBegin = ?, TimeEnd = ?, Event_ID = ?, Tournament_ID = ?, Building = ?, RoomNumber = ?, Status = ? WHERE TimeBlock_ID = ?', [startDate, endDate, event_id, tournament_id, building, roomNumber, status, id]);
        if ('affectedRows' in update) {
            if (update.affectedRows === 0) {
                return res.status(404).json({ message: 'Timeblock id not found' });
            }
        }
        res.status(200).json({ message: 'Edit timeblock successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error editing timeblock ' });
    }
});
exports.editTimeblock = editTimeblock;
// Delete timeblock (and associated team timeblocks)
const deleteTimeblock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid timeblock id' });
    }
    try {
        const [check] = yield db_config_1.default.execute('SELECT * FROM TimeBlock WHERE TimeBlock_ID = ?', [id]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }
        db_config_1.default.execute('DELETE FROM TimeBlock WHERE TimeBlock_ID = ?', [id]);
        db_config_1.default.execute('DELETE FROM TeamTimeBlock WHERE TimeBlock_ID = ?', [id]);
        res.status(200).json({ message: 'Delete timeblock successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting timeblock', error });
    }
});
exports.deleteTimeblock = deleteTimeblock;
// Get timeblocks based on event id
const getTimeblocksByEventId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid event id' });
    }
    try {
        const [check] = yield db_config_1.default.execute('SELECT * FROM TimeBlock WHERE Event_ID = ?', [id]);
        res.status(200).json(check);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving timeblocks', error });
    }
});
exports.getTimeblocksByEventId = getTimeblocksByEventId;
// Get timeblocks based on tournament id
const getTimeblocksByTournamentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid tournament id' });
    }
    try {
        const [check] = yield db_config_1.default.execute('SELECT * FROM TimeBlock WHERE Tournament_ID = ?', [id]);
        if (check.length === 0) {
            return res.status(401).json({ message: 'Timeblock does not exist' });
        }
        res.status(200).json(check);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving timeblocks', error });
    }
});
exports.getTimeblocksByTournamentId = getTimeblocksByTournamentId;
const getTimeBlockStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { TimeBlock_ID } = req.params; // Updated the parameter to match the query
    try {
        const [rows] = yield db_config_1.default.execute(`
            SELECT status FROM TimeBlock WHERE TimeBlock_ID = ?
        `, [TimeBlock_ID]);
        ;
        if (rows.length === 0) {
            return res.status(404).json({ message: 'TimeBlock not found' });
        }
        res.json({ status: rows[0].status });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving TimeBlock status' });
    }
});
exports.getTimeBlockStatus = getTimeBlockStatus;
const updateTimeBlockStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { TimeBlock_ID } = req.params;
    const { status } = req.body;
    if (typeof status !== 'number') {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    try {
        const [result] = yield db_config_1.default.execute(`
            UPDATE TimeBlock SET status = ? WHERE TimeBlock_ID = ?
        `, [status, TimeBlock_ID]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'TimeBlock status updated successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating TimeBlock status' });
    }
});
exports.updateTimeBlockStatus = updateTimeBlockStatus;
