import jwt from 'jsonwebtoken'
const genToken=async (userId)=>{
    try{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"});
    return token;
    }
    catch(err){
        console.log("Error generating token",err);
        throw new Error("Token generation failed");
    }
}
export default genToken;