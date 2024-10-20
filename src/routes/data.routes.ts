import { Router } from 'express';
import { addTournament, getAllTournaments, editTournament, deleteTournament, getTourneyById, getCurrentTournamentIds, getCurrentTournamentsByGroupId } from '../controllers/tournament.controller';
import { updateEventStatus, getEventStatus, getEventSupervisorEventById, updateEventForEventSupervisor, removeEventFromEventSupervisor, addEvent, deleteEvent, editEvent, getAllEvents, getEventById, getEventsByEventSupervisorId, getEventsByTournamentId, addEventToEventSupervisor, getEventsByEventSupervisor, getEventsBySupervisorAndTournamentId, getTotalAbsentByEvent, getEventStatusByEventId, getScorePercentageByEventId, finalizeEventByEventId, getEventsByTournamentAndSupervisor, checkAndUpdateEventStatus } from '../controllers/event.controller';
import { addSchool, deleteSchool, editSchool, getAllSchools, getSchoolById } from '../controllers/school.controller';
import { addTeam, deleteTeam, editTeam, getAllTeams, getTeamById, getTeamsBySchoolId } from '../controllers/team.controllers';
import { addScore, deleteScore, editScore, getScoreById, getScoresByEventId, getScoresBySchoolGroupId, getScoresBySchoolId, getScoresByTeamId, getScoresByTournamentId } from '../controllers/score.controllers';
import { updateTimeBlockStatus, getTimeBlockStatus, addTimeblocks, editTimeblock, deleteTimeblock, getTimeblocksByEventId, getTimeblocksByTournamentId} from '../controllers/timeblock.controller'
import { addSchoolGroup, deleteSchoolGroup, editSchoolGroup, getAllSchoolGroups } from '../controllers/schoolgroups.controllers'
import { getTeamTimeBlockWithSchoolById,getUniqueIdByTeamTimeBlockId, updateAttendStatus, getAttendStatus, updateTeamTimeBlockComment, getTeamTimeBlockComment, addTeamTimeBlock, deleteTeamTimeBlock, editTeamTimeBlock, getTeamTimeBlockById, getTeamTimeBlocksByEventId, getTeamTimeBlocksByTeamId, getTeamTimeBlocksByTimeBlockId } from '../controllers/teamtimeblock.controller';
import { getPDFBySchoolGroupId, uploadOrUpdatePDF, uploadMiddleware, createQuestion, deleteQuestion, addAnswer, getQuestion, getAnswersBySchoolGroupId} from '../controllers/library.controllers';

const router = Router();

//Tournament
router.post('/add-tournament', addTournament);
router.get('/get-tournaments', getAllTournaments);
router.put('/edit-tournament/:id', editTournament);
router.delete('/delete-tournament/:id', deleteTournament);
router.get('/get-tournament/:id', getTourneyById);
router.get('/get-current-tournaments', getCurrentTournamentIds);
router.get('/get-current-tournaments/:groupId', getCurrentTournamentsByGroupId)


//Event 
router.post('/add-event', addEvent);
router.put('/edit-event/:id', editEvent);
router.get('/get-events-all', getAllEvents);
router.get('/get-events-by-tournament/:tournamentId', getEventsByTournamentId);
router.get('/get-events-by-supervisor/:supervisorId', getEventsByEventSupervisorId);
router.delete('/delete-event/:id', deleteEvent);
router.get('/get-event/:id', getEventById);
router.get('/get-events/supervisor/:eventSupervisorId/tournament/:tournamentId', getEventsByTournamentAndSupervisor);
router.get('/event/:eventId/absent-teams', getTotalAbsentByEvent);
router.put('/events/:eventId/update-status', checkAndUpdateEventStatus);;

//School
router.post('/add-school', addSchool);
router.put('/edit-school/:id', editSchool);
router.get('/get-schools', getAllSchools);
router.delete('/delete-school/:id', deleteSchool);
router.get('/get-school/:id', getSchoolById);

//Team
router.post('/add-team', addTeam);
router.get('/get-team/:id', getTeamById);
router.get('/get-teams', getAllTeams);
router.delete('/delete-team/:id', deleteTeam);
router.put('/edit-team/:id', editTeam);
router.get('/get-teams-by-school/:schoolId', getTeamsBySchoolId);

//Score
router.post('/add-score', addScore);
router.put('/edit-score/:id', editScore);
router.delete('/delete-score/:id', deleteScore);
router.get('/get-score/:id', getScoreById);
router.get('/get-score-by-tournament/:tournamentId', getScoresByTournamentId);
router.get('/get-score-by-event/:eventId', getScoresByEventId);
router.get('/get-score-by-team/:teamId', getScoresByTeamId);
router.get('/get-score-by-school/:schoolId', getScoresBySchoolId);
router.get('/get-score-by-school-group/:schoolGroupId', getScoresBySchoolGroupId);

//Assignt Event 
router.post('/add-EventSupervisorsEvent', addEventToEventSupervisor);
router.delete('/delete-EventSuperVisorsEvent', removeEventFromEventSupervisor);
router.get('/get-event-supervisor/:id/events', getEventsByEventSupervisor);
router.get('/get-event-supervisor-event/:id', getEventSupervisorEventById);
router.put('/update-EventSupervisorsEvent/:eventSuperVisorEventID', updateEventForEventSupervisor);
router.get('/event/:event_id/status', getEventStatus);
router.put('/event/:event_id/status', updateEventStatus);
router.get('/get-event-status/:eventId', getEventStatusByEventId); 
router.get('/get-score-percentage/:eventId', getScorePercentageByEventId);
router.put('/event/:eventId/finalize', finalizeEventByEventId);

// Timeblock
router.post('/add-timeblocks', addTimeblocks);
router.put('/edit-timeblock/:id', editTimeblock);
router.delete('/delete-timeblock/:id', deleteTimeblock);
router.get('/get-timeblock-by-event/:id', getTimeblocksByEventId);
router.get('/get-timeblocks-by-tournament/:id', getTimeblocksByTournamentId);
router.get('/timeblock/:TimeBlock_ID/status', getTimeBlockStatus);
router.put('/timeblock/:TimeBlock_ID/status', updateTimeBlockStatus);

// Team Timeblocks
router.post('/add-team-timeblock', addTeamTimeBlock);
router.put('/edit-team-timeblock/:id', editTeamTimeBlock);
router.delete('/delete-team-timeblock/:id', deleteTeamTimeBlock);
router.get('/get-team-timeblocks-by-id/:id', getTeamTimeBlockById);
router.get('/get-team-timeblocks-by-team/:teamId', getTeamTimeBlocksByTeamId);
router.get('/get-team-timeblocks-by-timeblock/:timeBlockId', getTeamTimeBlocksByTimeBlockId);
router.get('/get-team-timeblocks-by-event/:eventId', getTeamTimeBlocksByEventId);
router.get('/team-timeblock/:TeamTimeBlock_ID/comment', getTeamTimeBlockComment);
router.put('/team-timeblock/:TeamTimeBlock_ID/comment', updateTeamTimeBlockComment);
router.get('/teamtimeblock/:teamTimeBlockId/attend', getAttendStatus);
router.put('/teamtimeblock/:teamTimeBlockId/attend', updateAttendStatus);
router.get('/team-timeblocks-get-school-name/:id', getTeamTimeBlockWithSchoolById);
router.get('/team-timeblocks/:id/unique-id', getUniqueIdByTeamTimeBlockId);

// School Groups
router.post('/add-schoolgroup', addSchoolGroup);
router.put('/edit-schoolgroup/:id', editSchoolGroup);
router.delete('/delete-schoolgroup/:id', deleteSchoolGroup);
router.get('/get-schoolgroups-all', getAllSchoolGroups);

//Resource Library - General Rules
router.get('/get-pdf/:schoolGroup_id', getPDFBySchoolGroupId);
router.post('/upload-pdf', uploadMiddleware, uploadOrUpdatePDF);

//Resource Library - Q and A
router.post('/questions', createQuestion);
router.delete('/questions/:QandA_id', deleteQuestion);
router.put('/questions/:QandA_id/answer', addAnswer);
router.get('/questions/:QandA_id', getQuestion);
router.get('/answers/schoolGroup/:schoolGroup_id', getAnswersBySchoolGroupId);

export default router;