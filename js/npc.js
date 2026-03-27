// ============================================
// NPC SYSTEM (Enhanced Pixel-Art Characters)
// ============================================
class NPC {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.gridX = config.x;
        this.gridY = config.y;
        this.map = config.map;
        this.direction = DIR.DOWN;
        this.pixelX = this.gridX * TILE_SIZE;
        this.pixelY = this.gridY * TILE_SIZE;
        this.active = config.active !== undefined ? config.active : true;
        this.bobTimer = Math.random() * 1000;
    }

    update() {
        this.bobTimer += 16;
    }

    facePlayer(player) {
        if (player.gridX > this.gridX) this.direction = DIR.RIGHT;
        else if (player.gridX < this.gridX) this.direction = DIR.LEFT;
        else if (player.gridY > this.gridY) this.direction = DIR.DOWN;
        else if (player.gridY < this.gridY) this.direction = DIR.UP;
    }

    isAdjacentTo(px, py) {
        const dx = Math.abs(this.gridX - px);
        const dy = Math.abs(this.gridY - py);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    draw(ctx, camX, camY) {
        if (!this.active) return;
        const px = Math.round(this.pixelX - camX);
        const py = Math.round(this.pixelY - camY);
        const S = TILE_SIZE;
        const bob = Math.sin(this.bobTimer / 400) * 1;

        // Special item types
        if (this.type === 'note') {
            ctx.fillStyle = '#FFFFFF';
            let b = Math.sin(Date.now() / 200) * 2;
            ctx.fillRect(px + 8, py + 12 + b, 16, 12);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(px + 10, py + 14 + b, 12, 2);
            ctx.fillRect(px + 10, py + 18 + b, 12, 2);
            return;
        }
        if (this.type === 'keycard') {
            ctx.save();
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = Math.abs(Math.sin(Date.now() / 300)) * 10 + 5;
            let b = Math.sin(Date.now() / 150) * 4;
            ctx.fillRect(px + 10, py + 10 + b, 12, 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 0;
            ctx.fillRect(px + 12, py + 12 + b, 8, 4);
            ctx.restore();
            return;
        }
        if (this.type === 'tree') {
            ctx.save();
            // Pot
            ctx.fillStyle = '#A06040';
            ctx.fillRect(px + 10, py + 20, 12, 10);
            // Trunk
            ctx.fillStyle = '#806030';
            ctx.fillRect(px + 14, py + 12, 4, 10);
            // Leaves (glowing)
            ctx.fillStyle = '#30C040';
            ctx.shadowColor = '#30FF50';
            ctx.shadowBlur = Math.abs(Math.sin(Date.now() / 400)) * 8 + 4;
            ctx.beginPath(); ctx.arc(px + 16, py + 8, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#20A030';
            ctx.beginPath(); ctx.arc(px + 12, py + 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + 20, py + 6, 6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            // Name label
            this.drawNameLabel(ctx, px, py);
            return;
        }

        // Character colours
        let bodyColor = '#FFFFFF', hairColor = '#604020', skinColor = '#FFC0A0';
        let hasGlasses = false, hasApron = false, hasBadge = false, hasTie = false;
        let tieColor = '#FF4040';

        switch (this.type) {
            case 'mother':
                bodyColor = '#FFA0C0'; hairColor = '#804020'; hasApron = true;
                break;
            case 'father':
                bodyColor = '#607090'; hairColor = '#303030'; hasTie = true; tieColor = '#204080';
                break;
            case 'receptionist':
                bodyColor = '#A0E0FF'; hasGlasses = true; hasBadge = true; hairColor = '#201010';
                break;
            case 'moderator':
                bodyColor = '#808890'; hasGlasses = true; hairColor = '#505050'; hasTie = true; tieColor = '#FF1050';
                break;
            case 'candidate':
                bodyColor = '#FFFFE0'; hasTie = true; tieColor = '#4080C0';
                break;
            case 'hr':
                bodyColor = '#202020'; hasGlasses = true; hairColor = '#100808'; skinColor = '#E0A080';
                break;
            case 'guard':
                bodyColor = '#2040A0'; hairColor = '#202020';
                break;
            case 'janitor':
                bodyColor = '#60A060'; hairColor = '#606060';
                break;
            case 'employee':
                bodyColor = '#C0B080'; hasTie = true; tieColor = '#808080';
                break;
            case 'tech':
                bodyColor = '#404060'; hairColor = '#302020';
                break;
            case 'senior_dev':
                bodyColor = '#1A3060'; hairColor = '#202020'; hasTie = true; tieColor = '#FFD060';
                hasBadge = true; hasGlasses = true;
                break;
        }

        ctx.save();
        const cy = py + bob;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(px + S/2, py + S - 2, 8, 3, 0, 0, Math.PI*2); ctx.fill();

        // Legs
        ctx.fillStyle = '#404060';
        ctx.fillRect(px + 8, cy + 22, 5, 8);
        ctx.fillRect(px + 19, cy + 22, 5, 8);

        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(px + 6, cy + 10, 20, 14);
        // Body shading
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(px + 6, cy + 20, 20, 4);

        // Apron (mother)
        if (hasApron) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px + 10, cy + 14, 12, 10);
            ctx.strokeStyle = '#C0C0C0'; ctx.lineWidth = 0.5;
            ctx.strokeRect(px + 10, cy + 14, 12, 10);
        }

        // Badge (receptionist)
        if (hasBadge) {
            ctx.fillStyle = '#FFD060';
            ctx.fillRect(px + 8, cy + 12, 6, 4);
        }

        // Tie
        if (hasTie) {
            ctx.fillStyle = tieColor;
            ctx.fillRect(px + S/2 - 1, cy + 10, 3, 10);
            // Tie knot
            ctx.fillRect(px + S/2 - 2, cy + 10, 5, 3);
        }

        // Head
        ctx.fillStyle = skinColor;
        ctx.fillRect(px + 8, cy + 1, 16, 12);
        // Head rounded top
        ctx.beginPath(); ctx.arc(px + S/2, cy + 4, 8, Math.PI, 0); ctx.fill();

        // Hair
        ctx.fillStyle = hairColor;
        if (this.direction === DIR.UP) {
            ctx.fillRect(px + 8, cy + 1, 16, 6);
        } else {
            ctx.fillRect(px + 8, cy, 16, 4);
            ctx.fillRect(px + 7, cy + 1, 2, 6);
            ctx.fillRect(px + 23, cy + 1, 2, 6);
        }

        // Eyes (directional)
        if (this.direction !== DIR.UP) {
            ctx.fillStyle = '#FFFFFF';
            let eyeOffX = 0;
            if (this.direction === DIR.LEFT) eyeOffX = -2;
            if (this.direction === DIR.RIGHT) eyeOffX = 2;

            ctx.fillRect(px + 10 + eyeOffX, cy + 5, 4, 4);
            ctx.fillRect(px + 18 + eyeOffX, cy + 5, 4, 4);
            // Pupils
            ctx.fillStyle = '#000000';
            let pupilOff = 0;
            if (this.direction === DIR.LEFT) pupilOff = -1;
            if (this.direction === DIR.RIGHT) pupilOff = 1;
            ctx.fillRect(px + 11 + eyeOffX + pupilOff, cy + 6, 2, 2);
            ctx.fillRect(px + 19 + eyeOffX + pupilOff, cy + 6, 2, 2);

            // Glasses
            if (hasGlasses) {
                ctx.strokeStyle = '#000000'; ctx.lineWidth = 1;
                ctx.strokeRect(px + 9 + eyeOffX, cy + 4, 6, 6);
                ctx.strokeRect(px + 17 + eyeOffX, cy + 4, 6, 6);
                ctx.beginPath();
                ctx.moveTo(px + 15 + eyeOffX, cy + 7);
                ctx.lineTo(px + 17 + eyeOffX, cy + 7);
                ctx.stroke();
            }
        }

        // Alien glow for HR
        if (this.type === 'hr') {
            ctx.fillStyle = COLORS.NEON_RED;
            ctx.globalAlpha = Math.sin(Date.now() / 200) * 0.5 + 0.5;
            ctx.fillRect(px + 12, cy + 6, 2, 3);
            ctx.fillRect(px + 20, cy + 6, 2, 3);
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();

        // Name label (styled pill)
        this.drawNameLabel(ctx, px, py);
    }

    drawNameLabel(ctx, px, py) {
        const name = this.name;
        ctx.font = '9px "Share Tech Mono", monospace';
        const textW = ctx.measureText(name).width;
        const labelW = textW + 12;
        const labelX = px + TILE_SIZE / 2 - labelW / 2;
        const labelY = py - 14;

        // Pill background
        ctx.fillStyle = 'rgba(10,15,25,0.85)';
        ctx.beginPath();
        ctx.moveTo(labelX + 4, labelY);
        ctx.lineTo(labelX + labelW - 4, labelY);
        ctx.quadraticCurveTo(labelX + labelW, labelY, labelX + labelW, labelY + 4);
        ctx.lineTo(labelX + labelW, labelY + 8);
        ctx.quadraticCurveTo(labelX + labelW, labelY + 12, labelX + labelW - 4, labelY + 12);
        ctx.lineTo(labelX + 4, labelY + 12);
        ctx.quadraticCurveTo(labelX, labelY + 12, labelX, labelY + 8);
        ctx.lineTo(labelX, labelY + 4);
        ctx.quadraticCurveTo(labelX, labelY, labelX + 4, labelY);
        ctx.fill();

        // Border
        ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 0.5;
        ctx.stroke();

        // Text
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.fillText(name, labelX + 6, labelY + 9);
    }
}

function createNPCs() {
    return [
        // Home
        new NPC({ id: 'mother', name: 'Mom', type: 'mother', x: 10, y: 7, map: 'home' }),
        new NPC({ id: 'father', name: 'Dad', type: 'father', x: 16, y: 5, map: 'home' }),

        // Company - Lobby
        new NPC({ id: 'receptionist', name: 'Sarah', type: 'receptionist', x: 24, y: 25, map: 'company' }),
        new NPC({ id: 'guard', name: 'Officer Rex', type: 'guard', x: 24, y: 31, map: 'company' }),
        new NPC({ id: 'senior_dev', name: 'Uncle Arjun', type: 'senior_dev', x: 22, y: 31, map: 'company' }),
        new NPC({ id: 'janitor', name: 'Old Murphy', type: 'janitor', x: 15, y: 28, map: 'company' }),
        new NPC({ id: 'watercooler_emp', name: 'Dave', type: 'employee', x: 9, y: 29, map: 'company' }),
        new NPC({ id: 'nervousC', name: 'Candidate C', type: 'candidate', x: 13, y: 30, map: 'company' }),
        new NPC({ id: 'confidentD', name: 'Candidate D', type: 'candidate', x: 15, y: 30, map: 'company' }),

        // Company - GD Room
        new NPC({ id: 'moderator', name: 'Mr. Grey', type: 'moderator', x: 13, y: 13, map: 'company' }),
        new NPC({ id: 'candidate1', name: 'Alice', type: 'candidate', x: 11, y: 15, map: 'company' }),
        new NPC({ id: 'candidateB', name: 'Bob', type: 'candidate', x: 15, y: 15, map: 'company' }),

        // Company - Upper Floor
        new NPC({ id: 'tech', name: 'IT Ravi', type: 'tech', x: 22, y: 22, map: 'company' }),
        new NPC({ id: 'senior', name: 'Ms. Chen', type: 'employee', x: 30, y: 25, map: 'company' }),

        // Items
        new NPC({ id: 'hint_note', name: 'Strange Note', type: 'note', x: 14, y: 15, map: 'company', active: false }),
        new NPC({ id: 'server_keycard', name: 'Server Keycard', type: 'keycard', x: 26, y: 28, map: 'company', active: false }),

        // Server Tree (puzzle trigger)
        new NPC({ id: 'server_tree', name: 'Strange Plant', type: 'tree', x: 20, y: 18, map: 'company', active: false }),

        // HR
        new NPC({ id: 'hr', name: 'HR Overlord', type: 'hr', x: 36, y: 13, map: 'company' })
    ];
}
