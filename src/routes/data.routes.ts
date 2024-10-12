import { Router } from 'express';
import { addTournament } from '../controllers/tournament.controller';


const router = Router();

//Tournament
router.post('/add-tournament', addTournament);


export default router;