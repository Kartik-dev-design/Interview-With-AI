import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {getCurrentUser} from "../controllers/User.controller.js";
const userrouter=express.Router();
userrouter.get('/current-user',isAuth,getCurrentUser)
export default userrouter;