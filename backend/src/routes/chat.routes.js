const express=require("express")
const {authUser} = require("../middlewares/authMiddleware")
const { chatController } = require("../controller/chat.controller")
const router=express.Router()

router.post("/",authUser,chatController)



module.exports=router