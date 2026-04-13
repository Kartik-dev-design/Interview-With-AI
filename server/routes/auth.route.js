import express from "express";
import { googleAuth,logOut} from "../controllers/Auth.controller.js";

const authrouter=express.Router();



authrouter.post("/google",googleAuth)
authrouter.get("/logout",logOut)
export default authrouter;