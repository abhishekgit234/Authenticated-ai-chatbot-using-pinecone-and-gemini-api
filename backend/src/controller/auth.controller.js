const usermodel=require("../models/usermodel")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
async function registerController(req,res){
    const {fullName:{firstName,lastName},email,password}=req.body;
    const isUserexist=await usermodel.findOne({
        email
    }) 
    if(isUserexist){
        return res.status(400).json({
            msg:"user already exist"
        })
    }
    const user=await usermodel.create({
        fullName:{
            firstName,lastName
        },
        email,
        password: await bcrypt.hash(password,10)
    })
    const token=jwt.sign({id:user._id},process.env.JWT_SECRETKEY);
    res.cookie("token",token);
    res.status(201).json({
        msg:"user registeres successfuly",
        user:{
            email:user.email,
            fullName:user.fullName,
            id:user._id
        }
    })
}
async function loginController(req,res){
    const {email,password}=req.body;
    const user= await usermodel.findOne({
        email
    })
    if(!user){
        return res.status(400).json({
            msg:"email not registered"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({
            msg:"incorrect password"
        })

    }
    const token =jwt.sign({id:user._id},process.env.JWT_SECRETKEY)
    res.cookie("token",token)
    return res.status(200).json({
        msg:"user logged in successfully",
        user:{
            fullName:user.fullName,
            email:user.email,
            id:user._id
        }
    })

}

module.exports={registerController,loginController}