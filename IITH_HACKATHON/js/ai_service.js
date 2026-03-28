// ============================================
// AI SERVICE - Communicates with Node.js Backend
// ============================================
class AIService {
    constructor() {
        this.backendUrl = "http://localhost:3000/chat";
    }

    async chat(npcId, npcType, userText) {
        console.log(`Sending message to backend for ${npcId}...`);

        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    npcId: npcId,
                    npcType: npcType,
                    message: userText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Backend error.");
            }

            const data = await response.json();
            return data.response;
        } catch (err) {
            console.error("AI Service Error:", err);
            return "Sorry, my networking is down. Can't talk right now. (Check if backend server is running!)";
        }
    }
}
