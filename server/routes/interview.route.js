import express from 'express';
import  isAuth from "../middlewares/isAuth.js";
import {upload} from "../middlewares/multer.js";
import { analyzeResume, finishInterview, getInterviewReport,getMyInterviews } from '../controllers/InterviewController.js';
import   {generateQuestion} from '../controllers/InterviewController.js'
import { submitAnswer } from '../controllers/InterviewController.js';
//import { getMyInterviews } from '../controllers/InterviewController.js';
const interviewRouter = express.Router();
interviewRouter.post('/resume',isAuth,upload.single('resume'),analyzeResume)
interviewRouter.post('/generate-questions',isAuth,generateQuestion)
interviewRouter.post('/submit-answer',isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)
interviewRouter.get("/get-interview",isAuth,getMyInterviews)
interviewRouter.get("/get-interview/:id",isAuth,getInterviewReport)
export default interviewRouter;