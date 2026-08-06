const {Server}=require("socket.io")
const cookie=require("cookie")
const jwt=require("jsonwebtoken")
const usermodel=require("../models/usermodel")
const aiService=require("../services/ai.services")
const messageModel=require("../models/message.model")
const {createMemory,queryMemory}=require("../services/vector.service")

function initSocketServer(httpServer){
    const io= new Server(httpServer,{})

    io.use(async(socket,next)=>{
        const cookies=cookie.parse(socket.handshake.headers?.cookie||"")
        if(!cookies.token){
            next(new Error("authentication error:please logged in"))
        }
        try{
            const decoded= jwt.verify(cookies.token,process.env.JWT_SECRETKEY)
            const user =await usermodel.findById(decoded.id)
            socket.user=user
            next()

        } catch(err){
            next(new Error("authentciation failed:invalid token"))

        }

    })

    io.on("connection",(socket)=>{
        // console.log("uśēr connected",socket.user)
        // console.log("new socket connection",socket.id)
        socket.on("ai-message",async (content)=>{
            console.log(content)

            const message=await messageModel.create({
                chat:content.chat,
                user:socket.user._id,
                content:content.text,
                role:"user"
            })
            console.log("initilaizing vectors")
            const vectors=await aiService.generateVectors(content.text)  // we are generating the vectors these vectors are now passed to the createMemory method

            const memory=await queryMemory({
                queryVector:vectors,
                limit:3,
                metadata:{}
            })
            

            await createMemory({
                vectors,
                messageId: message._id,
                metadata:{
                    chat:content.chat,
                    user:socket.user._id,
                    text:content.text
                }
            })

            console.log(memory)

            


            const chatHistory= await messageModel.find({
                chat:content.chat
            })

            // console.log("chat history",chatHistory.map(item=>{
            //     return{
            //         role:item.role,
            //         parts:[{text:item.content}]
            //     }
            // }))
            const response=await aiService.generateResponse(chatHistory.map(item=>{  //  model conversation sequence ke hisaab se usi ka jawab deta hai jo next to bot hota h or last question asked by user only
                return{
                    role:item.role,
                    parts:[{text:item.content}]
                }
            }))

           const responseMessage= await messageModel.create({
                chat:content.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            const responseVector=await aiService.generateVectors(response)

            await createMemory({
                vectors:responseVector,
                messageId:responseMessage._id,
                metadata:{
                    chat:content.chat,
                    user:socket.user._id,
                    text:response
                }
            })

            socket.emit("ai-response",{
                content:response,
                chat:content.chat
            })
        })
        
    })
}

module.exports=initSocketServer