import  express  from "express";
import authControllers from "../controllers/auth.controllers";

const router = express.Router();

// Get Requests

router.get('/validate', authControllers.validateToken);
router.get('/get/all', authControllers.getAllusers);

// Post Requests

router.post('/register', authControllers.register);
router.post('/login', authControllers.login);


export = router;
