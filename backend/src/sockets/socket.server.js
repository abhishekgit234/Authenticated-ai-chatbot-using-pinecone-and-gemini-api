const { Server } = require("socket.io")
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const usermodel = require("../models/usermodel")
const aiService = require("../services/ai.services")
const messageModel = require("../models/message.model")
const { createMemory, queryMemory } = require("../services/vector.service")

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {})

    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
        if (!cookies.token) {
            next(new Error("authentication error:please logged in"))
        }
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRETKEY)
            const user = await usermodel.findById(decoded.id)
            socket.user = user
            next()

        } catch (err) {
            next(new Error("authentciation failed:invalid token"))

        }

    })
    console.log("1");

    io.on("connection", (socket) => {
        // console.log("uśēr connected",socket.user)
        // console.log("new socket connection",socket.id)
        socket.on("ai-message", async (content) => {
            console.log("2");
            console.log(content)

            const message = await messageModel.create({
                chat: content.chat,
                user: socket.user._id,
                content: content.text,
                role: "user"
            })
            console.log("3");
            console.log("initilaizing vectors")
            const vectors = await aiService.generateVectors(content.text)  // we are generating the vectors these vectors are now passed to the createMemory method

            const memory = await queryMemory({
                queryVector: vectors,
                limit: 3,


            })
            console.log(
                "MEMORY:",
                memory.map(item => ({
                    score: item.score,
                    text: item.metadata?.text,
                    chat: item.metadata?.chat
                }))


            )


            await createMemory({
                vectors,
                messageId: message._id,
                metadata: {
                    chat: content.chat,
                    user: socket.user._id,
                    text: content.text
                }
            })






            const chatHistory = await messageModel.find({
                chat: content.chat
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            chatHistory.reverse();

            // console.log("chat history",chatHistory.map(item=>{
            //     return{
            //         role:item.role,
            //         parts:[{text:item.content}]
            //     }
            // }))
            const stm = chatHistory.map(item => {  //  model conversation sequence ke hisaab se usi ka jawab deta hai jo next to bot hota h or last question asked by user only
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [{
                role: "model",
                parts: [{
                    text: `these are some of the previous chats used them to generate response
                    ${memory.map(item => item.metadata.text).join("/n")}`
                }]
            }]

            console.log("ltm", [...ltm]);
            console.log("stm", [...stm]);
            const response = await aiService.generateResponse([...ltm, ...stm])
            console.log("ai");

            const responseMessage = await messageModel.create({
                chat: content.chat,
                user: socket.user._id,
                content: response,
                role: "model"
            })

            const responseVector = await aiService.generateVectors(response)

            await createMemory({
                vectors: responseVector,
                messageId: responseMessage._id,
                metadata: {
                    chat: content.chat,
                    user: socket.user._id,
                    text: response
                }
            })

            socket.emit("ai-response", {
                content: response,
                chat: content.chat
            })
        })

    })
}

module.exports = initSocketServer