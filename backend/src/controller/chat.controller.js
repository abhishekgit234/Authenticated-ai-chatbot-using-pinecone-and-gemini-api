const chatModel=require("../models/chat.model")

async function chatController(req,res){
    const{title}=req.body  //frontend se sirf title aayga
    const user=req.user

    const chat=await chatModel.create({
        user:user._id,  // ham user mai id dere hai jo hamne middleware se req.user mai data dala tha uski id hai 
        title
    })

    return res.status(209).json({
        msg:"chat created",
        chat:{
            id:chat._id,
            title:title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }
    })

}



module.exports={chatController}