// ============================================
// TUTORIAL SYSTEM (First-Time Player Guide)
// ============================================
class TutorialSystem {
    constructor() {
        this.active = false;
        this.step = 0;
        this.completed = false;
        this.alpha = 0;
        this.arrowBob = 0;

        this.steps = [
            { text: "Use WASD or Arrow Keys to move around", icon: "🎮", highlight: "player" },
            { text: "Press E or Enter to interact with NPCs and objects", icon: "💬", highlight: "npc" },
            { text: "Talk to your Mother to get your mission!", icon: "👩", highlight: "mother" },
            { text: "Walk to the door at the bottom to exit the house", icon: "🚪", highlight: "door" },
            { text: "Good luck, Candidate! Your destiny awaits...", icon: "⭐", highlight: null }
        ];

        // Check if tutorial already completed
        try {
            this.completed = localStorage.getItem('iod_tutorial_done') === 'true';
        } catch(e) { this.completed = false; }
    }

    start() {
        if (this.completed) return;
        this.active = true;
        this.step = 0;
        this.alpha = 0;
    }

    advance() {
        if (!this.active) return;
        this.step++;
        this.alpha = 0;
        if (this.step >= this.steps.length) {
            this.active = false;
            this.completed = true;
            try { localStorage.setItem('iod_tutorial_done', 'true'); } catch(e) {}
        }
    }

    update(dt) {
        if (!this.active) return;
        this.alpha = Math.min(1, this.alpha + dt * 0.003);
        this.arrowBob = Math.sin(Date.now() / 300) * 6;
    }

    draw(ctx) {
        if (!this.active || this.step >= this.steps.length) return;

        const s = this.steps[this.step];

        // Dimmed overlay
        ctx.fillStyle = `rgba(0,0,10,${0.4 * this.alpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Tutorial box
        const bw = 500, bh = 80;
        const bx = (CANVAS_WIDTH - bw) / 2;
        const by = CANVAS_HEIGHT - bh - 30;

        ctx.globalAlpha = this.alpha;

        // Box background
        ctx.fillStyle = 'rgba(10,15,30,0.95)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#40a0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Glow line at top
        const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, '#40a0ff');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, bw, 2);

        // Icon
        ctx.font = '28px serif';
        ctx.fillText(s.icon, bx + 16, by + 48);

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px "Share Tech Mono", monospace';
        ctx.fillText(s.text, bx + 56, by + 36);

        // Continue hint
        ctx.fillStyle = '#6090b0';
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillText('Press E or Enter to continue...', bx + 56, by + 60);

        // Step indicator
        ctx.fillStyle = '#40a0ff';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.step + 1}/${this.steps.length}`, bx + bw - 12, by + bh - 10);
        ctx.textAlign = 'left';

        // Bouncing arrow
        if (s.highlight) {
            ctx.fillStyle = '#40a0ff';
            ctx.font = '20px "Share Tech Mono", monospace';
            ctx.fillText('▼', CANVAS_WIDTH / 2 - 6, 80 + this.arrowBob);
        }

        ctx.globalAlpha = 1;
    }
}
