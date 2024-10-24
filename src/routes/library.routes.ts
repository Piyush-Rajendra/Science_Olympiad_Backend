import express from 'express';
import { getPDFBySchoolGroupId, 
    uploadOrUpdatePDF, 
    uploadMiddleware, 
    createQuestion,
    deleteQuestion,
    addAnswer,
    getQuestion,
    getAnswersBySchoolGroupId,
    editQA} from '../controllers/library.controllers';

const router = express.Router();

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