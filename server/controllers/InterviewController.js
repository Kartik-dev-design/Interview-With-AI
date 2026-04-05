import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";
import User from "../models/usermodels.js"
import Interview from "../models/interviewModel.js"
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path // pehle frontend sae file liya maine 

    const fileBuffer = await fs.promises.readFile(filepath) // us file ko binary format mae read kiya 
    const uint8Array = new Uint8Array(fileBuffer) // us binary data ko uint8array mae convert kiya taki pdfjsLib use kar sake

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise; // pdf ko read kiya aur uska object banaya jisse hum text extract kar sake
    let resumeText = "";
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    } // yaha par maien pages extract karein aur unko string maein convert kiya aur haa usmain see white spaces hata saakhu 
    // aur phir uss puri string ko message format mae ai ko bheja taki wo structured data return karein a
    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();
    const messages = [
      {
        role: "system",
        content: `
  Extract structured data from resume.

  Return strictly JSON:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];// yaha par maien system message maein instructions diye ki resume se structured data extract karna hai aur usko strictly JSON format maein return karna hai
    // aur user message maein maien pura resume text bheja taki ai usko analyze kar sake aur structured data return karein.
    const aiResponse = await askAi(messages) // yaha par maien ai se response le raha hu jo ki ek string hogi jisme structured data hoga jo ki JSON format maein hoga.
    const parsed = JSON.parse(aiResponse);//
    fs.unlinkSync(filepath)
    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });
  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};
export const generateQuestions=async(req,res)=>{
  try {
      let {role,experience,skills,mode,resumeText,projects}=req.body;//front sae data liya maine interview ke form sae jisme role, experience, skills, mode, resumeText aur projects hote hain
         role=role?.trim()// us data ko trim kiya taki agar user ne extra spaces diye hain to wo remove ho jayein
        experience=experience?.trim()// us data ko trim kiya taki agar user ne extra spaces diye hain to wo remove ho jayein
        mode=mode?.trim();// us data ko trim kiya taki agar user ne extra spaces diye hain to wo remove ho jayein
        if(!role || !experience || !mode){
          return res.status(400).json({message:"Role, experience and mode are required"})
        }//frontend sae role, experience aur mode required hain to maine check kiya ki agar ye teeno cheezein nahi hain to error return kar doon
          const user=await User.findById(req.userId);// database sae user ko find kiya jiska id req.userId hai jo ki authentication middleware sae aata hai
          if(!user){  
            return res.status(404).json({message:"User not found"})
          }
          if(user.credits< 50){
            return res.status(400).json({message:"Insufficient credits"})
          }// user ke credits check kiye ki kya uske paas 50 se zyada credits hain kyunki question generate karne ke liye 50 credits chahiye hote hain
          const projectText=Array.isArray(projects)&& projects.length ? projects.join(", ") : "None";// projects ko string maein convert kiya taki ai ko bheja ja sake aur agar projects nahi hain to "None" return kar doon
          const skillsText=Array.isArray(skills) && skills.length ? skills.join(", ") : "None";// skills ko string maein convert kiya taki ai ko bheja ja sake aur agar skills nahi hain to "None" return kar doon
          const safeResumeText=resumeText ?.trim()|| "None";// resumeText ko trim kiya taki agar user ne extra spaces diye hain to wo remove ho jayein aur agar resumeText nahi hai to "None" return kar doon
          const userPrompt=`Role:${role} 
          Experience:${experience} 
          Interview Mode:${mode}
          Projects:${projectText}
          skills:${skillsText}
          Resume:${safeResumeText}`;// yaha par maien userPrompt banaya jisme maien role, experience, mode, projects, skills aur resumeText ko format kiya taki ai ko bheja ja sake aur uske basis par questions generate kar sake
          if(!userPrompt.trim()){
            return res.status(400).json({message:"No valid information provided to generate questions"})
          }// yaha par maien check kiya ki userPrompt empty to nahi hai kyunki agar user ne koi valid information nahi di hai to questions generate karna possible nahi hoga
          const messages = [

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];
   const aiResponse = await askAi(messages);
   if(!aiResponse || !aiResponse.trim()){
    return res.status(500).json({message:"AI did not return any questions"})
   }// yaha par maien check kiya ki aiResponse empty to nahi hai kyunki agar ai ne koi questions return nahi kiye hain to error return karna chahiye
   const questionsArray=aiResponse.split("\n").map(q=>q.trim()).filter(q=>q.length > 0).slice(0,5);
   if(questionsArray.length === 0){
    return res.status(500).json({message:"AI did not return any valid questions"})
   }
   user.credits-=50;
   await user.save();// user ke credits me se 50 minus kiya kyunki question generate karne ke liye 50 credits chahiye hote hain aur phir user ko save kiya taki database me changes reflect ho jayein
   
    const interview=await Interview.create({
       userId:user._id,
       role,
       experience,
       mode,
       resumeText:safeResumeText,
       questions:questionsArray.map((q,index)=>({
       question:q,
       difficulty:["easy","easy","medium","medium","hard"][index],
       timeLimit:[60,60,90,90,120][index],
       }))
    })// yaha par maien interview create kar raha hu database me jisme userId, role, experience, mode, resumeText aur questions hote hain jisme har question ke saath uski difficulty aur timeLimit bhi store kiya ja raha hai taki future me interview ko track kiya ja sake
    res.json({
      interviewId:interview._id,
      creditsLeft:user.credits,
      userName:user.name,
      questions:interview.questions
    })
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
  }
}
export const submitAnswer=async(req,res)=>{
    try{
        const {interviewId,questionindex,answer,timetaken}=req.body;//frontend sae data liya maine jisme interviewId, questionindex, answer aur timetaken hote hain

        const interview=await Interview.findById(interviewId);// database sae interview ko find kiya jiska id interviewId hai jo ki frontend sae aata hai
        const question=interview.questions[questionindex];// interview ke questions me se us question ko nikala jiska index questionindex hai jo ki frontend sae aata hai
        if(!answer){
           question.score=0;
           question.feedback="You did not provide an answer.";
           question.answer="";
           await interview.save();// question ke score ko 0 set kar diya kyuki user ane anser nhi diya hain toh database amien maine uss particular 
           // question ko update kar diya taki uska score 0 ho jaye.
           return res.json({
               feeback:question.feedback,
           })
        }
        if(timetaken>question.timeLimit){
           question.score=0;
           question.feedback=`Time limit exceeded. You took ${timetaken} seconds but the limit was ${question.timeLimit} seconds.`;
           question.answer=answer;
           await interview.save();//agar jooh database maein time set kiya kia gaya hain usee zayda time lag raha hain 
           // toh question ke score ko 0 set kar diya kyuki user ne time limit exceed kar diya hain toh database amien maine uss particular
           return res.json({
               feeback:question.feedback,
           })
        }
      const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];// yaha par maien system message maein instructions diye ki ai ko answer evaluate karna hai confidence, communication aur correctness ke basis par aur uske basis par finalScore calculate karna hai aur human feedback dena hai aur user message maein maien question aur answer ko format kiya taki ai ko bheja ja sake aur uske basis par evaluation ho sake
    const aiResponse=await askAi(messages);//yaha par maien ai se response le raha hu jo ki ek string hogi jismae confidence, communication, correctness, finalScore aur feedback hoga jo ki JSON format maein hoga
    const parsed=JSON.parse(aiResponse);// yaha par maien aiResponse ko parse kiya taki usme se confidence, communication, correctness, finalScore aur feedback nikal sakhu
    question.answer=answer;
    question.confidence=parsed.confidence;
    question.communication=parsed.communication;
    question.correctness=parsed.correctness;
    question.score=parsed.finalScore;
    question.feedback=parsed.feedback;
    await interview.save();
    return res.status(200).json({
      feeback:parsed.feedback,
    })
    }
    catch(error){ 
      return res.status(500).json({
        message:`failed to submit answer ${error}`
      })
}
}
export const finishInterview=async(req,res)=>{
   try{
     const {interviewId}=req.body;//frontend sae data liya maine jisme interviewId hota hai
     const interview=await Interview.findById(interviewId);// database sae interview ko find kiya jiska id interviewId hai jo ki frontend sae aata hai
     if(!interview){
      return res.status(404).json({message:"Interview not found"})
     }
      const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
        finalScore: Number(finalScore.toFixed(1)),
        confidence: Number(avgConfidence.toFixed(1)),
        communication: Number(avgCommunication.toFixed(1)),
        correctness: Number(avgCorrectness.toFixed(1)),
        questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
   }
   catch(error){
      return res.status(500).json({message:`failed to finish Interview ${error}`})
   }
}


