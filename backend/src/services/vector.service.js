// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortChatGptIndex = pc.Index('cohort-chatgpt').namespace("default");

async function createMemory({vectors,metadata,messageId}){

    await cohortChatGptIndex.upsert({
    records: [
      {
        id: messageId,   // 🔥 FORCE STRING
        values: vectors,
        metadata
      }
    ]
  });

}

async function queryMemory({queryVector,limit=5,metadata}){
    const data=await cohortChatGptIndex.query({
        vector:queryVector,
        topK:limit,  // topk tells that closest point dedo jitni limit hai for ex 5 hai to 5 closest point dedo ek vector ke
        filter: {
        user: {
        $eq: "userId"
        }
       },   //filter: metadata ? {metadata} : undefined
        includeMetadata:true
    })
    return data.matches

}

module.exports={
    createMemory,
    queryMemory
}

// Create a dense index with integrated embedding
// const indexName = 'quickstart-js';
// await pc.createIndexForModel({
//   name: indexName,
//   cloud: 'aws',
//   region: 'us-east-1',
//   embed: {
//     model: 'llama-text-embed-v2',
//     fieldMap: { text: 'chunk_text' },
//   },
//   waitUntilReady: true,
// });
