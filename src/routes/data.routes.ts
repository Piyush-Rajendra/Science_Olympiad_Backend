import { Router } from 'express';
import { addTournament, getAllTournaments, editTournament, deleteTournament, getTourneyById } from '../controllers/tournament.controller';
import { getEventSupervisorEventById, updateEventForEventSupervisor, removeEventFromEventSupervisor, addEvent, deleteEvent, editEvent, getAllEvents, getEventById, getEventsByEventSupervisorId, getEventsByTournamentId, addEventToEventSupervisor, getEventsByEventSupervisor } from '../controllers/event.controller';
import { addSchool, deleteSchool, editSchool, getAllSchools, getSchoolById } from '../controllers/school.controller';
import { addTeam, deleteTeam, editTeam, getAllTeams, getTeamById, getTeamsBySchoolId } from '../controllers/team.controllers';
import { addScore, deleteScore, editScore, getScoreById, getScoresByEventId, getScoresBySchoolGroupId, getScoresBySchoolId, getScoresByTeamId, getScoresByTournamentId } from '../controllers/score.controllers';


const router = Router();

//Tournament
router.post('/add-tournament', addTournament);
router.get('/get-tournaments', getAllTournaments);
router.put('/edit-tournament/:id', editTournament);
router.delete('/delete-tournament/:id', deleteTournament);
router.get('/get-tournament/:id', getTourneyById);

//Event 
router.post('/add-event', addEvent);
router.put('/edit-event/:id', editEvent);
router.get('/get-events-all', getAllEvents);
router.get('/get-events-by-tournament/:tournamentId', getEventsByTournamentId);
router.get('/get-events-by-supervisor/:supervisorId', getEventsByEventSupervisorId);
router.delete('/delete-event/:id', deleteEvent);
router.get('/get-event/:id', getEventById);

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


export default router;