// ============================================
// NPC MEMORY & PROGRESSION SYSTEM
// ============================================
class MemorySystem {
    constructor() {
        this.memories = {};
        this.flags = {
            gdScore: 0,
            roundsPassed: 0, // 1 = passed GD, 2 = passed Puzzle
            bossesDefeated: 0,
            hasJob: false,
            roundFailed: false,
            hasKeycard: false
        };
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('interview_destiny_memories');
            if (saved) {
                const data = JSON.parse(saved);
                this.memories = data.memories || {};
                this.flags = data.flags || this.flags;
            }
        } catch (e) {
            this.memories = {};
        }
    }

    save() {
        try {
            localStorage.setItem('interview_destiny_memories', JSON.stringify({
                memories: this.memories,
                flags: this.flags
            }));
        } catch (e) { /* localStorage may fail */ }
    }

    getMemory(npcId) {
        if (!this.memories[npcId]) {
            this.memories[npcId] = {
                playerName: null,
                interactionCount: 0,
                sentimentData: [],
                flags: {}
            };
        }
        return this.memories[npcId];
    }

    setPlayerName(name) {
        // Set name globally across all major NPCs
        this.getMemory('receptionist').playerName = name;
        this.getMemory('hr').playerName = name;
        this.save();
    }

    getPlayerName() {
        return this.getMemory('receptionist').playerName;
    }

    recordInteraction(npcId, type, detail) {
        const mem = this.getMemory(npcId);
        mem.interactionCount++;

        if (detail) {
            mem.sentimentData.push({ type, detail, time: Date.now() });
        }
        this.save();
    }

    // specific tracking for Group Discussion
    addGDScore(points) {
        this.flags.gdScore += points;
        this.save();
    }

    getGDScore() {
        return this.flags.gdScore;
    }

    failRound() {
        this.flags.roundFailed = true;
        this.save();
    }

    clearFailState() {
        this.flags.roundFailed = false;
        this.flags.gdScore = 0; // reset score on retry
        this.save();
    }

    clearAll() {
        this.memories = {};
        this.flags = { gdScore: 0, roundsPassed: 0, bossesDefeated: 0, hasJob: false, roundFailed: false, hasKeycard: false };
        localStorage.removeItem('interview_destiny_memories');
    }
}
