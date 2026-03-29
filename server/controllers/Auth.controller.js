/* frontend data  */
import User from '../models/usermodels.js'
import genToken from '../config/token.js';
export const googleAuth=async(req,res)=>{
    try{
         const {name,email}=req.body;
         let user=await User.findOne({email})
         if(!user){
            user=await User.create({name,email});
         }
         let token=await genToken(user._id);
         res.cookie("token",token,{
              http:true,
              secure:false,
              samesite:"strict",
              maxAge:7*24*60*60*1000

         })
         return res.status(200).json(user)
    }
    catch(error){
          return res.status(500).json({message:`Google auth failed ${error.message}`})
    }
}
export const logOut=async(req,res)=>{
   try{
       await res.clearCookie("token")
       return res.status(200).json({message:"Logout successful"})
   }
   catch(error){
       return res.status(500).json({message:`Logout failed ${error.message}`})
   }
}