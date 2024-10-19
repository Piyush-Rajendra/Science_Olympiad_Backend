import { Router } from 'express';
import { addTournament, getAllTournaments, editTournament, deleteTournament, getTourneyById, getCurrentTournamentIds, getCurrentTournamentsByGroupId } from '../controllers/tournament.controller';
import { updateEventStatus, getEventStatus, getEventSupervisorEventById, updateEventForEventSupervisor, removeEventFromEventSupervisor, addEvent, deleteEvent, editEvent, getAllEvents, getEventById, getEventsByEventSupervisorId, getEventsByTournamentId, addEventToEventSupervisor, getEventsByEventSupervisor, getEventsBySupervisorAndTournamentId, getTotalAbsentByEvent } from '../controllers/event.controller';
import { addSchool, deleteSchool, editSchool, getAllSchools, getSchoolById } from '../controllers/school.controller';
import { addTeam, deleteTeam, editTeam, getAllTeams, getTeamById, getTeamsBySchoolId } from '../controllers/team.controllers';
import { addScore, deleteScore, editScore, getScoreById, getScoresByEventId, getScoresBySchoolGroupId, getScoresBySchoolId, getScoresByTeamId, getScoresByTournamentId } from '../controllers/score.controllers';
import { updateTimeBlockStatus, getTimeBlockStatus, addTimeblocks, editTimeblock, deleteTimeblock, getTimeblocksByEventId, getTimeblocksByTournamentId} from '../controllers/timeblock.controller'
import { addSchoolGroup, deleteSchoolGroup, editSchoolGroup, getAllSchoolGroups } from '../controllers/schoolgroups.controllers'
import { updateTeamTimeBlockComment, getTeamTimeBlockComment, addTeamTimeBlock, deleteTeamTimeBlock, editTeamTimeBlock, getTeamTimeBlockById, getTeamTimeBlocksByEventId, getTeamTimeBlocksByTeamId, getTeamTimeBlocksByTimeBlockId } from '../controllers/teamtimeblock.controller';


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
router.get('/get-events/supervisor/:supervisorId/tournament/:tournamentId', getEventsBySupervisorAndTournamentId);
router.get('/event/:eventId/absent-teams', getTotalAbsentByEvent);

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

// School Groups
router.post('/add-schoolgroup', addSchoolGroup);
router.put('/edit-schoolgroup/:id', editSchoolGroup);
router.delete('/delete-schoolgroup/:id', deleteSchoolGroup);
router.get('/get-schoolgroups-all', getAllSchoolGroups);


export default router;