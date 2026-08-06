const mongoose= require("mongoose");


async function connectToDb(){
    
    try{
        await mongoose.connect(process.env.MONGODB)
        console.log("db connected");
    }
    catch(err){
        console.log("db connection failed");
    }
    
}

module.exports=connectToDb;