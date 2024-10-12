import { Router } from 'express';
import { addTournament, getAllTournaments, editTournament, deleteTournament } from '../controllers/tournament.controller';
import { addEvent, deleteEvent, editEvent, getAllEvents, getEventsByEventSupervisorId, getEventsByTournamentId } from '../controllers/event.controller';


const router = Router();

//Tournament
router.post('/add-tournament', addTournament);
router.get('/get-tournaments', getAllTournaments);
router.put('/edit-tournament/:id', editTournament);
router.delete('/delete-tournament/:id', deleteTournament);

//Event 
router.post('/add-event', addEvent);
router.put('/edit-event/:id', editEvent);
router.get('/get-events-all', getAllEvents);
router.get('/get-events-by-tournament/:tournamentId', getEventsByTournamentId);
router.get('/get-events-by-supervisor/:supervisorId', getEventsByEventSupervisorId);
router.delete('/delete-event/:id', deleteEvent);


export default router;