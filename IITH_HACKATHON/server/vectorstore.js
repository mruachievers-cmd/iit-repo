const fs = require('fs');
const path = require('path');

class SimpleVectorStore {
    constructor() {
        this.dbPath = path.join(__dirname, 'data', 'vectors.json');
        this.data = [];
        this.init();
    }

    init() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (fs.existsSync(this.dbPath)) {
            try {
                this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
            } catch (e) { this.data = []; }
        }
    }

    save() {
        fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    }

    // High-quality local frequency embedding (32-dim)
    getEmbedding(text) {
        if (!text) return new Array(32).fill(0);
        const v = new Array(32).fill(0);
        const input = text.toLowerCase();
        
        // Character trigram hashes for "real" similarity
        for(let i=0; i<input.length-2; i++) {
            const trigram = input.substring(i, i+3);
            let hash = 0;
            for(let j=0; j<trigram.length; j++) hash = (hash << 5) - hash + trigram.charCodeAt(j);
            v[Math.abs(hash) % 32] += 1;
        }

        // Normalize
        let mag = Math.sqrt(v.reduce((sum, val) => sum + val*val, 0));
        if (mag === 0) mag = 1;
        return v.map(val => val / mag);
    }

    _cosineSimilarity(v1, v2) {
        let dot = 0;
        for (let i = 0; i < v1.length; i++) dot += v1[i] * v2[i];
        return dot;
    }

    async add(npcId, role, text) {
        const vector = this.getEmbedding(text);
        this.data.push({
            npcId, role, text, vector,
            timestamp: Date.now()
        });
        this.save();
    }

    search(npcId, text, topK = 3) {
        const queryVector = this.getEmbedding(text);
        let filtered = this.data.filter(d => d.npcId === npcId);
        
        const results = filtered.map(d => ({
            ...d,
            similarity: this._cosineSimilarity(queryVector, d.vector)
        }));

        results.sort((a,b) => b.similarity - a.similarity);
        return results.slice(0, topK).sort((a,b) => a.timestamp - b.timestamp);
    }
}

module.exports = SimpleVectorStore;
