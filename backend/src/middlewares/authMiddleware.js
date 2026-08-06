const userModel=require("../models/usermodel");
const jwt=require("jsonwebtoken")


async function authUser(req,res,next){
    const {token}=req.cookies

    if(!token){
        return res.status(401).json({
            msg:"logged in first"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRETKEY)  // yha se hame vo data miega jo hamne token create krte time payload mai dala tha i.e id
        const user=await userModel.findById(decoded.id)   // us id ki help se hamne user find kar lia apne db mai se 
        req.user=user;  // ab vohi user ko hamne bhej dia req.user mai 
        next()  // then ab ye controller ko pass kardia jayga 

    }catch(err){
        return res.status(400).json({
            msg:"invalid token"
        })
    }

}

module.exports={authUser}