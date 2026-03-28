const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const SimpleVectorStore = require('./vectorstore');
const NLPEngine = require('./nlp_engine');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Systems
const nlp = new NLPEngine();
const db = new SimpleVectorStore();

// Endpoint /chat
app.post('/chat', async (req, res) => {
    const { npcId, npcType, message } = req.body;

    if (!message) return res.status(400).json({ error: "No message sent." });

    try {
        console.log(`\x1b[36mNPC ${npcId} talking...\x1b[0m`);

        // Retrieval from Vector DB (Persistence)
        const relevantMemories = db.search(npcId, message);
        let context = relevantMemories.map(m => m.text).join('; ');

        // Generate AI Response locally
        const aiResponse = await nlp.generateResponse(npcId, npcType, message, relevantMemories);

        // Save conversation persistence
        db.add(npcId, 'user', message);
        db.add(npcId, 'ai', aiResponse);

        console.log(`\x1b[32mSuccess! [Local AI] responded to Candidate.\x1b[0m`);

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("\x1b[31mError generating chat:\x1b[0m", error);
        res.status(500).json({ error: "Server error in local AI processing." });
    }
});

app.listen(PORT, () => {
    console.log(`\x1b[32m[BACKEND SECURE] 100% Reliable Local Vector DB Backend running at http://localhost:${PORT}\x1b[0m`);
    console.log(`Gemini API key not required anymore. All AI processing is 100% Local.`);
});
