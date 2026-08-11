const {GoogleGenAI}=require("@google/genai")

const ai=new GoogleGenAI({});
async function generateResponse(content){

    const response= await ai.models.generateContent({
        model:"gemini-3.6-flash",
        contents:content
    })
    return response.text

}
async function generateVectors(content){
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents :content,
    //     contents: [
    //   {
    //     role: "user",
    //     parts: [{ text: content }]
    //   }
    // ],
        config:{
            outputDimensionality:768   // bydefault 3072 ke dimensions generate krta hai but we want ki 768 ke he kare
        }

    })
    return response.embeddings[0].values
}

module.exports={
    generateResponse,generateVectors
}