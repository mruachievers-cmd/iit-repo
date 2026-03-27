// ============================================
// LOGIC PUZZLE SYSTEM (Round 2)
// ============================================
class PuzzleSystem {
    constructor() {
        this.active = false;
        this.nodes = [];
        this.sequence = [];
        this.playerSequence = [];
        this.state = 'idle'; // idle, show, wait
        this.timer = 0;
        this.showIndex = 0;
        this.round = 1;
        this.maxRounds = 3;

        this.onWin = null;
        this.onLose = null;
        this.feedback = "INITIALIZING CORE DECRYPTION...";
        this.feedbackTimer = 0;
        this.failedOnce = false;
    }

    start(onWin, onLose) {
        this.active = true;
        this.onWin = onWin;
        this.onLose = onLose;
        this.round = 1;
        this.failedOnce = false;

        // Create 4 nodes
        const cx = CANVAS_WIDTH / 2;
        const cy = CANVAS_HEIGHT / 2;
        const dist = 100;

        this.nodes = [
            { id: 0, x: cx, y: cy - dist, color: COLORS.NEON_RED, highlight: false }, // Top
            { id: 1, x: cx + dist, y: cy, color: COLORS.NEON_GREEN, highlight: false }, // Right
            { id: 2, x: cx, y: cy + dist, color: COLORS.NEON_BLUE, highlight: false }, // Bottom
            { id: 3, x: cx - dist, y: cy, color: '#FFFF00', highlight: false } // Left
        ];

        this.startRound();
    }

    startRound() {
        this.sequence = [];
        this.playerSequence = [];
        this.showIndex = 0;
        this.state = 'idle';

        // Generate sequence
        const length = 2 + this.round; // Round 1: 3, Round 2: 4, Round 3: 5
        for (let i = 0; i < length; i++) {
            this.sequence.push(Math.floor(Math.random() * 4));
        }

        this.setFeedback(`ROUND ${this.round}: MEMORIZE SEQUENCE`, 2000);
        this.timer = 2000;
    }

    setFeedback(msg, time) {
        this.feedback = msg;
        this.feedbackTimer = time;
    }

    update(dt) {
        if (!this.active) return;

        if (this.feedbackTimer > 0) this.feedbackTimer -= dt;

        if (this.state === 'idle') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'show';
                this.timer = 600;
            }
        }
        else if (this.state === 'show') {
            this.timer -= dt;

            // Turn off highlight halfway through
            if (this.timer < 300) {
                this.nodes.forEach(n => n.highlight = false);
            } else {
                this.nodes[this.sequence[this.showIndex]].highlight = true;
            }

            if (this.timer <= 0) {
                this.showIndex++;
                if (this.showIndex >= this.sequence.length) {
                    this.state = 'wait';
                    this.setFeedback("INPUT SEQUENCE", 5000);
                } else {
                    this.timer = 600;
                }
            }
        }
    }

    handleClick(x, y) {
        if (this.state !== 'wait') return;

        // Check if clicked a node
        for (const node of this.nodes) {
            const dx = x - node.x;
            const dy = y - node.y;
            if (dx * dx + dy * dy < 1600) { // 40px radius
                this.playerSequence.push(node.id);
                node.highlight = true;
                setTimeout(() => node.highlight = false, 200);

                // Verify
                const idx = this.playerSequence.length - 1;
                if (this.playerSequence[idx] !== this.sequence[idx]) {
                    // Fail
                    this.setFeedback("DECRYPTION FAILED.", 2000);
                    this.state = 'idle';
                    this.timer = 2000;
                    setTimeout(() => {
                        this.active = false;
                        if (this.onLose) this.onLose();
                    }, 2000);
                    return;
                }

                if (this.playerSequence.length === this.sequence.length) {
                    // Passed round
                    if (this.round >= this.maxRounds) {
                        this.setFeedback("SYSTEM DECRYPTED.", 3000);
                        this.state = 'done';
                        setTimeout(() => {
                            this.active = false;
                            if (this.onWin) this.onWin();
                        }, 2000);
                    } else {
                        this.setFeedback(`ACCESS PARTIAL. PREPARING ROUND ${this.round + 1}`, 1500);
                        this.round++;
                        this.state = 'idle';
                        this.timer = 1500;
                        setTimeout(() => this.startRound(), 1500);
                    }
                }
                return;
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = 'rgba(5, 5, 10, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Termial UI
        ctx.strokeStyle = COLORS.NEON_BLUE;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);

        // Feedback
        if (this.feedbackTimer > 0 || this.state === 'done') {
            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.font = '20px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.feedback, CANVAS_WIDTH / 2, 100);
            ctx.textAlign = 'left';
        }

        // Draw Nodes
        this.nodes.forEach(n => {
            // connection lines
            ctx.beginPath();
            ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.lineTo(n.x, n.y);
            ctx.strokeStyle = 'rgba(64, 160, 255, 0.2)';
            ctx.stroke();

            // Node
            ctx.beginPath();
            ctx.arc(n.x, n.y, 40, 0, Math.PI * 2);
            ctx.fillStyle = n.highlight ? '#FFFFFF' : n.color;
            ctx.fill();
            if (n.highlight) {
                ctx.shadowColor = n.color;
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        });

        // Center Node
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#202020';
        ctx.fill();
        ctx.stroke();
    }
}
