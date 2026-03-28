// ============================================
// VECTOR DATABASE (Mock for Client-Side Local Storage)
// ============================================
class VectorDB {
    constructor() {
        this.vectors = [];
        this.load();
    }

    load() {
        try {
            const data = localStorage.getItem('interview_destiny_vectors');
            if (data) this.vectors = JSON.parse(data);
        } catch(e) { this.vectors = []; }
    }

    save() {
        localStorage.setItem('interview_destiny_vectors', JSON.stringify(this.vectors));
    }

    // Mock embedding: counts frequency of letters and common words, returns array of 20 floats
    _getEmbedding(text) {
        if (!text) return new Array(20).fill(0);
        const vec = new Array(20).fill(0);
        const words = text.toLowerCase().split(/\W+/);
        for(let i=0; i<words.length; i++) {
            if (!words[i]) continue;
            let hash = 0;
            for(let j=0; j<words[i].length; j++) {
                hash = (hash << 5) - hash + words[i].charCodeAt(j);
                hash |= 0;
            }
            vec[Math.abs(hash) % 20] += 1;
        }
        // Normalize
        let mag = Math.sqrt(vec.reduce((sum, v) => sum + v*v, 0));
        if (mag === 0) mag = 1;
        return vec.map(v => v / mag);
    }

    _cosineSimilarity(v1, v2) {
        let dot = 0;
        for(let i=0; i<v1.length; i++) dot += v1[i]*v2[i];
        return dot;
    }

    storeMessage(npcId, role, text) {
        if (!text) return;
        const vec = this._getEmbedding(text);
        this.vectors.push({ npcId, role, text, vector: vec, timestamp: Date.now() });
        this.save();
    }

    queryContext(npcId, text, topK = 3) {
        const queryVec = this._getEmbedding(text);
        let npcHistory = this.vectors.filter(v => v.npcId === npcId);
        
        npcHistory.sort((a, b) => {
            const simA = this._cosineSimilarity(queryVec, a.vector);
            const simB = this._cosineSimilarity(queryVec, b.vector);
            return simB - simA; // Descending similarity
        });

        // Get top K, but sort them chronologically to build conversation logic properly
        let topResults = npcHistory.slice(0, topK);
        topResults.sort((a,b) => a.timestamp - b.timestamp);

        const historyContext = topResults.map(r => `${r.role === 'user' ? 'Candidate' : 'You'}: ${r.text}`).join('\n');
        return historyContext || "No previous interaction.";
    }

    clear() {
        this.vectors = [];
        this.save();
    }
}
