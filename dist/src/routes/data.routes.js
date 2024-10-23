"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournament_controller_1 = require("../controllers/tournament.controller");
const event_controller_1 = require("../controllers/event.controller");
const school_controller_1 = require("../controllers/school.controller");
const team_controllers_1 = require("../controllers/team.controllers");
const score_controllers_1 = require("../controllers/score.controllers");
const timeblock_controller_1 = require("../controllers/timeblock.controller");
const schoolgroups_controllers_1 = require("../controllers/schoolgroups.controllers");
const teamtimeblock_controller_1 = require("../controllers/teamtimeblock.controller");
const tournamentHistory_controllers_1 = require("../controllers/tournamentHistory.controllers");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
//Tournament
router.post('/add-tournament', tournament_controller_1.addTournament);
router.get('/get-tournaments', tournament_controller_1.getAllTournaments);
router.put('/edit-tournament/:id', tournament_controller_1.editTournament);
router.delete('/delete-tournament/:id', tournament_controller_1.deleteTournament);
router.get('/get-tournament/:id', tournament_controller_1.getTourneyById);
router.get('/get-current-tournaments', tournament_controller_1.getCurrentTournamentIds);
router.get('/get-current-tournaments/:groupId', tournament_controller_1.getCurrentTournamentsByGroupId);
//Tournament History
router.post('/tournaments/:tournamentId/add-history', tournamentHistory_controllers_1.addTournamentHistory);
router.get('/get-tournament-history/:schoolgroupID', tournamentHistory_controllers_1.getTournamentHistoryBySchoolGroup);
router.get('/tournament-history/:id/download', tournamentHistory_controllers_1.downloadTournamentHistory);
//Event 
router.post('/add-event', event_controller_1.addEvent);
router.put('/edit-event/:id', event_controller_1.editEvent);
router.get('/get-events-all', event_controller_1.getAllEvents);
router.get('/get-events-by-tournament/:tournamentId', event_controller_1.getEventsByTournamentId);
router.get('/get-events-by-supervisor/:supervisorId', event_controller_1.getEventsByEventSupervisorId);
router.delete('/delete-event/:id', event_controller_1.deleteEvent);
router.get('/get-event/:id', event_controller_1.getEventById);
router.get('/get-events/supervisor/:eventSupervisorId/tournament/:tournamentId', event_controller_1.getEventsByTournamentAndSupervisor);
router.get('/event/:eventId/absent-teams', event_controller_1.getTotalAbsentByEvent);
router.put('/events/:eventId/update-status', event_controller_1.checkAndUpdateEventStatus);
;
//School
router.post('/add-school', school_controller_1.addSchool);
router.put('/edit-school/:id', school_controller_1.editSchool);
router.get('/get-schools', school_controller_1.getAllSchools);
router.delete('/delete-school/:id', school_controller_1.deleteSchool);
router.get('/get-school/:id', school_controller_1.getSchoolById);
router.get('/get-schools-by-tournament/:tournamentId', school_controller_1.getSchoolsByTournamentId);
//Team
router.post('/add-team', team_controllers_1.addTeam);
router.get('/get-team/:id', team_controllers_1.getTeamById);
router.get('/get-teams', team_controllers_1.getAllTeams);
router.delete('/delete-team/:id', team_controllers_1.deleteTeam);
router.put('/edit-team/:id', team_controllers_1.editTeam);
router.get('/get-teams-by-school/:schoolId', team_controllers_1.getTeamsBySchoolId);
router.get('/get-teams-by-tournament/:tournamentId', team_controllers_1.getTeamsByTournamentId);
//Score
router.post('/add-score', score_controllers_1.addScore);
router.put('/edit-score/:id', score_controllers_1.editScore);
router.delete('/delete-score/:id', score_controllers_1.deleteScore);
router.get('/get-score/:id', score_controllers_1.getScoreById);
router.get('/get-score-by-tournament/:tournamentId', score_controllers_1.getScoresByTournamentId);
router.get('/get-score-by-event/:eventId', score_controllers_1.getScoresByEventId);
router.get('/get-score-by-team/:teamId', score_controllers_1.getScoresByTeamId);
router.get('/get-score-by-school/:schoolId', score_controllers_1.getScoresBySchoolId);
router.get('/get-score-by-school-group/:schoolGroupId', score_controllers_1.getScoresBySchoolGroupId);
//Assignt Event 
router.post('/add-EventSupervisorsEvent', event_controller_1.addEventToEventSupervisor);
router.delete('/delete-EventSuperVisorsEvent', event_controller_1.removeEventFromEventSupervisor);
router.get('/get-event-supervisor/:id/events', event_controller_1.getEventsByEventSupervisor);
router.get('/get-event-supervisor-event/:id', event_controller_1.getEventSupervisorEventById);
router.put('/update-EventSupervisorsEvent/:eventSuperVisorEventID', event_controller_1.updateEventForEventSupervisor);
router.get('/event/:event_id/status', event_controller_1.getEventStatus);
router.put('/event/:event_id/status', event_controller_1.updateEventStatus);
router.get('/get-event-status/:eventId', event_controller_1.getEventStatusByEventId);
router.get('/get-score-percentage/:eventId', event_controller_1.getScorePercentageByEventId);
router.put('/event/:eventId/finalize', event_controller_1.finalizeEventByEventId);
router.get('/get-eventSupervisor-id', event_controller_1.getEventSupervisorIdByEmail);
// Timeblock
router.post('/add-timeblocks', timeblock_controller_1.addTimeblocks);
router.put('/edit-timeblock/:id', timeblock_controller_1.editTimeblock);
router.delete('/delete-timeblock/:id', timeblock_controller_1.deleteTimeblock);
router.get('/get-timeblock-by-event/:id', timeblock_controller_1.getTimeblocksByEventId);
router.get('/get-timeblocks-by-tournament/:id', timeblock_controller_1.getTimeblocksByTournamentId);
router.get('/timeblock/:TimeBlock_ID/status', timeblock_controller_1.getTimeBlockStatus);
router.put('/timeblock/:TimeBlock_ID/status', timeblock_controller_1.updateTimeBlockStatus);
// Team Timeblocks
router.post('/add-team-timeblock', teamtimeblock_controller_1.addTeamTimeBlock);
router.put('/edit-team-timeblock/:id', teamtimeblock_controller_1.editTeamTimeBlock);
router.delete('/delete-team-timeblock/:id', teamtimeblock_controller_1.deleteTeamTimeBlock);
router.get('/get-team-timeblocks-by-id/:id', teamtimeblock_controller_1.getTeamTimeBlockById);
router.get('/get-team-timeblocks-by-team/:teamId', teamtimeblock_controller_1.getTeamTimeBlocksByTeamId);
router.get('/get-team-timeblocks-by-timeblock/:timeBlockId', teamtimeblock_controller_1.getTeamTimeBlocksByTimeBlockId);
router.get('/get-team-timeblocks-by-event/:eventId', teamtimeblock_controller_1.getTeamTimeBlocksByEventId);
router.get('/team-timeblock/:TeamTimeBlock_ID/comment', teamtimeblock_controller_1.getTeamTimeBlockComment);
router.put('/team-timeblock/:TeamTimeBlock_ID/comment', teamtimeblock_controller_1.updateTeamTimeBlockComment);
router.get('/teamtimeblock/:teamTimeBlockId/attend', teamtimeblock_controller_1.getAttendStatus);
router.put('/teamtimeblock/:teamTimeBlockId/attend', teamtimeblock_controller_1.updateAttendStatus);
router.get('/team-timeblocks-get-school-name/:id', teamtimeblock_controller_1.getTeamTimeBlockWithSchoolById);
router.get('/team-timeblocks/:id/unique-id', teamtimeblock_controller_1.getUniqueIdByTeamTimeBlockId);
// School Groups
router.post('/add-schoolgroup', schoolgroups_controllers_1.addSchoolGroup);
router.put('/edit-schoolgroup/:id', schoolgroups_controllers_1.editSchoolGroup);
router.delete('/delete-schoolgroup/:id', schoolgroups_controllers_1.deleteSchoolGroup);
router.get('/get-schoolgroups-all', schoolgroups_controllers_1.getAllSchoolGroups);
//Excel
//router.get('/export-tournaments', exportTournamentsToExcel);
router.get('/export-scores/:tournamentId', tournament_controller_1.exportTournamentScoresToExcel);
exports.default = router;
