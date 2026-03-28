const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    models.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
  } catch (e) {
    console.error("Failed to list models:", e);
  }
}

async function testEmbedding() {
    try {
        const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });
        const result = await embedModel.embedContent("Hello world");
        console.log("Embedding SUCCESS (embedding-001)");
    } catch (e) {
        console.error("Embedding FAILED (embedding-001):", e.status, e.statusText);
    }
}

listModels().then(testEmbedding);
