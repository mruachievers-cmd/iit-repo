const Fuse = require('fuse.js');

class NLPEngine {
    constructor() {
        this.personas = {
            'janitor': {
                name: "Old Murphy",
                base: "Just mopping up the mess from the last batch. Better keep moving.",
                secret: "The mops don't clean the blood anymore. Trust nothing. Look at the server walls.",
                riddle: "Doors that open can also close... especially when the giant wakes.",
                keycard: "IT Ravi? He dropped his card near reception. Too busy sweating to notice.",
                tree: "The plant in the corridor... it's not breathing. It's binary. Hack it if you dare."
            },
            'tech': {
                name: "IT Ravi",
                base: "Have you tried turning it off and on again? Wait, the server room won't even open.",
                panic: "If I don't find my keycard, I'm fired... or worse. It's somewhere near reception.",
                warning: "The electromagnetic signals are alive... almost like a heartbeat in the walls.",
                server: "The main terminal is offline. We need a secondary access point."
            },
            'guard': {
                name: "Officer Rex",
                base: "No badge, no entry. Stop asking questions and go to Sarah at Reception.",
                threat: "One more move and you'll be 'archived' permanently.",
                strict: "Reception is straight ahead. Don't touch anything on the way."
            },
            'senior_dev': {
                name: "Uncle Arjun",
                base: "Stay sharp kid, this company is cutthroat. Literally.",
                tip: "Go to the lobby reception first. Sarah has the schedule.",
                help: "The keycard tech guy dropped? It's hidden near the front desk. Use it on the glass doors.",
                advanced: "After the GD, you'll feel tired. Rest on the sofa. But be ready for the dream."
            },
            'watercooler_emp': {
                name: "Dave",
                base: "I'm busy analyzing synergystic paradigms. Don't bother me.",
                fear: "*sips water nervously* The last batch of candidates never came back from the server room...",
                denial: "I mean, they probably just got hired. Right? ...Right?"
            }
        };

        // Create Fuse indexes for each persona for keyword matching
        this.searchers = {};
        for(let id in this.personas) {
            const data = Object.entries(this.personas[id]).map(([key, value]) => ({ key, value }));
            this.searchers[id] = new Fuse(data, { keys: ['value', 'key'], threshold: 0.4 });
        }
    }

    async generateResponse(npcId, npcType, userText, context = []) {
        const id = npcId || npcType;
        const p = this.personas[id] || this.personas['watercooler_emp'];
        const query = userText.toLowerCase();

        // 1. Try Keyword Matching via Fuse
        const results = this.searchers[id] ? this.searchers[id].search(query) : [];
        let response = "";

        if (results.length > 0) {
            response = results[0].item.value;
        } else {
            // 2. Fallback to Context-Aware generic
            if (query.includes('hello') || query.includes('hi')) response = `Uh, hi. I'm ${p.name || 'busy'}. Keep moving.`;
            else if (query.includes('who are you')) response = `I'm ${p.name || 'nobody'}. Just trying to survive the quarter.`;
            else if (query.includes('help')) response = p.tip || p.base;
            else if (query.includes('keycard')) response = p.keycard || p.panic || "Ask the IT guy. He's always losing things.";
            else if (query.includes('what happened')) response = p.fear || p.secret || "Better to focus on your interview.";
            else response = p.base;
        }

        // 3. Optional: Add context fluff
        if (context.length > 0 && Math.random() > 0.6) {
            response += ` (And like we said before... stay focused.)`;
        }

        return response;
    }
}

module.exports = NLPEngine;
