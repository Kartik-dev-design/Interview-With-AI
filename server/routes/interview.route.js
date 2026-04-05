import express from 'express';
import  isAuth from "../middlewares/isAuth.js";
import {upload} from "../middlewares/multer.js";
import { analyzeResume, finishInterview } from '../controllers/InterviewController.js';
import { generateQuestions } from '../controllers/InterviewController.js';
import { submitAnswer } from '../controllers/InterviewController.js';
const interviewRouter = express.Router();
interviewRouter.post('/resume',isAuth,upload.single('resume'),analyzeResume)
interviewRouter.post('/generate-questions',isAuth,generateQuestions)
interviewRouter.post('/submit-answer',isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)
export default interviewRouter;