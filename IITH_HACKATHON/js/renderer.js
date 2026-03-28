// ============================================
// RENDERER - HUD, Glitch FX, Mini-Map, Particles
// ============================================
class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.glitchIntensity = 0;
        this.screenShake = 0;
        this.particles = [];
        this.victoryParticles = [];
        this.transitionAlpha = 0;
        this.transitioning = false;
    }

    triggerGlitch(intensity = 1.0) { this.glitchIntensity = intensity; }
    triggerShake(amount = 10) { this.screenShake = amount; }

    triggerTransition() {
        this.transitioning = true;
        this.transitionAlpha = 1.0;
    }

    update(dt) {
        if (this.glitchIntensity > 0) this.glitchIntensity -= dt * 0.002;
        if (this.screenShake > 0) this.screenShake -= dt * 0.05;
        if (this.transitioning) {
            this.transitionAlpha -= dt * 0.003;
            if (this.transitionAlpha <= 0) { this.transitionAlpha = 0; this.transitioning = false; }
        }

        // Ambient particles
        if (Math.random() < 0.02) {
            this.particles.push({
                x: Math.random() * CANVAS_WIDTH,
                y: -5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: 0.2 + Math.random() * 0.3,
                life: 3000 + Math.random() * 2000,
                size: 1 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.3
            });
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= dt;
            if (p.life <= 0 || p.y > CANVAS_HEIGHT) this.particles.splice(i, 1);
        }

        for (let i = this.victoryParticles.length - 1; i >= 0; i--) {
            const p = this.victoryParticles[i];
            p.x += p.vx; p.y += p.vy; p.vy += 0.1; // gravity
            p.life -= dt;
            if (p.life <= 0 || p.y > CANVAS_HEIGHT) this.victoryParticles.splice(i, 1);
        }
    }

    applyCameraShake(ctx) {
        if (this.screenShake <= 0) return;
        ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    drawMap(tilemap, camera) {
        const ctx = this.ctx;
        ctx.save();
        this.applyCameraShake(ctx);

        const cam = camera.getOffset();
        const startCol = Math.floor(cam.x / TILE_SIZE);
        const startRow = Math.floor(cam.y / TILE_SIZE);
        const endCol = startCol + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1;
        const endRow = startRow + Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 1;
        const mapSize = tilemap.getCurrentMapSize();

        for (let r = startRow; r <= endRow && r < mapSize.rows; r++) {
            for (let c = startCol; c <= endCol && c < mapSize.cols; c++) {
                if (r < 0 || c < 0) continue;
                const tile = tilemap.getTile(r, c);
                const px = c * TILE_SIZE - cam.x;
                const py = r * TILE_SIZE - cam.y;
                tilemap.drawTile(ctx, tile, px, py);
            }
        }
        ctx.restore();
    }

    drawGlitchEffect() {
        if (this.glitchIntensity <= 0) return;
        const ctx = this.ctx;
        ctx.globalCompositeOperation = 'overlay';
        for (let i = 0; i < 5 * this.glitchIntensity; i++) {
            const y = Math.random() * CANVAS_HEIGHT;
            const h = Math.random() * 10;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,16,80,0.2)' : 'rgba(16,160,255,0.2)';
            ctx.fillRect(0, y, CANVAS_WIDTH, h);
            if (Math.random() > 0.7) {
                const sx = (Math.random() - 0.5) * 20 * this.glitchIntensity;
                ctx.drawImage(ctx.canvas, 0, y, CANVAS_WIDTH, h, sx, y, CANVAS_WIDTH, h);
            }
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    drawAmbientParticles() {
        const ctx = this.ctx;
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(200,220,255,${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawTransition() {
        if (this.transitionAlpha <= 0) return;
        const ctx = this.ctx;
        ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawHUD(player, gameState, combatSystem) {
        const ctx = this.ctx;

        ctx.fillStyle = COLORS.UI_BG;
        ctx.fillRect(5, 5, 200, 40);
        ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 1;
        ctx.strokeRect(5, 5, 200, 40);

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillText(`CANDIDATE HP: ${Math.floor(player.hp)}`, 12, 18);

        ctx.fillStyle = COLORS.HP_RED;
        ctx.fillRect(12, 22, 180, 4);
        ctx.fillStyle = COLORS.HP_GREEN;
        ctx.fillRect(12, 22, Math.max(0, 180 * (player.hp / player.maxHp)), 4);

        if (gameState === STATE.BATTLE_ACTION) {
            ctx.fillStyle = '#404040';
            ctx.fillRect(12, 30, 180, 2);
            ctx.fillStyle = COLORS.STAMINA_BLUE;
            ctx.fillRect(12, 30, Math.max(0, 180 * (player.stamina / player.maxStamina)), 2);

            if (combatSystem && combatSystem.boss) {
                const b = combatSystem.boss;
                const bw = 400;
                const bx = (CANVAS_WIDTH - bw) / 2;
                ctx.fillStyle = COLORS.UI_BG;
                ctx.fillRect(bx - 5, CANVAS_HEIGHT - 35, bw + 10, 30);
                ctx.strokeStyle = COLORS.NEON_RED;
                ctx.strokeRect(bx - 5, CANVAS_HEIGHT - 35, bw + 10, 30);
                ctx.fillStyle = COLORS.UI_TEXT; ctx.textAlign = 'center';
                ctx.fillText(b.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 22);
                ctx.textAlign = 'left';
                ctx.fillStyle = '#400000';
                ctx.fillRect(bx, CANVAS_HEIGHT - 16, bw, 6);
                ctx.fillStyle = COLORS.NEON_RED;
                ctx.fillRect(bx, CANVAS_HEIGHT - 16, Math.max(0, bw * (b.hp / b.maxHp)), 6);
            }
        }
    }

    drawMiniMap(tilemap, player, npcs) {
        const ctx = this.ctx;
        const map = tilemap.maps[tilemap.currentMap];
        if (!map) return;

        const mw = 150, mh = 100;
        const mx = CANVAS_WIDTH - mw - 10, my = 50;
        const scaleX = mw / (map.cols * TILE_SIZE);
        const scaleY = mh / (map.rows * TILE_SIZE);

        // Background
        ctx.fillStyle = 'rgba(5,10,20,0.8)';
        ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
        ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 1;
        ctx.strokeRect(mx - 2, my - 2, mw + 4, mh + 4);

        // Draw tiles (simplified)
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                const tile = map.grid[r][c];
                let color = null;
                if (tile === T.WALL || tile === T.GLASS_WALL || tile === T.CUBICLE_WALL) color = '#607080';
                else if (tile === T.DOOR) color = '#A06030';
                else if (tile === T.FLOOR || tile === T.FLOOR_DARK || tile === T.RUG || tile === T.CARPET || tile === T.CHAIR) color = '#303840';
                else if (tile === T.STREET) color = '#252525';
                else if (tile === T.CORRUPT_FLOOR || tile === T.BLOOD_FLOOR) color = '#200010';
                else if (tile === T.CORRUPT_WALL) color = '#400020';
                else if (tile === T.VOID) color = '#050010';

                if (color) {
                    ctx.fillStyle = color;
                    const tx = mx + c * (mw / map.cols);
                    const ty = my + r * (mh / map.rows);
                    ctx.fillRect(tx, ty, Math.max(1, mw / map.cols), Math.max(1, mh / map.rows));
                }
            }
        }

        // NPC dots (yellow)
        npcs.forEach(npc => {
            if (!npc.active || npc.map !== tilemap.currentMap) return;
            if (npc.type === 'note' || npc.type === 'keycard') return;
            ctx.fillStyle = '#FFD060';
            const nx = mx + npc.gridX * (mw / map.cols);
            const ny = my + npc.gridY * (mh / map.rows);
            ctx.beginPath(); ctx.arc(nx, ny, 2, 0, Math.PI * 2); ctx.fill();
        });

        // Player dot (white, blinking)
        if (Math.sin(Date.now() / 200) > -0.3) {
            ctx.fillStyle = '#FFFFFF';
            const ppx = mx + player.pixelX * scaleX;
            const ppy = my + player.pixelY * scaleY;
            ctx.beginPath(); ctx.arc(ppx, ppy, 3, 0, Math.PI * 2); ctx.fill();
        }

        // Map name label
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = '8px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        const mapLabel = tilemap.currentMap === 'home' ? 'HOME' :
                         tilemap.currentMap === 'company' ? 'COMPANY HQ' : 'ARENA';
        ctx.fillText(mapLabel, mx + mw / 2, my + mh + 10);
        ctx.textAlign = 'left';
    }

    drawInteractionIndicator(ctx, npc, camX, camY) {
        const x = Math.round(npc.pixelX - camX + TILE_SIZE / 2);
        const y = Math.round(npc.pixelY - camY - 20);
        const bob = Math.sin(Date.now() / 300) * 3;

        // Glowing E button
        ctx.fillStyle = 'rgba(64,160,255,0.3)';
        ctx.beginPath(); ctx.arc(x, y + bob, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLORS.UI_BORDER;
        ctx.font = 'bold 12px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('E', x, y + bob + 4);
        ctx.textAlign = 'left';
    }

    drawTooltip(ctx, text, x, y) {
        ctx.font = '10px "Share Tech Mono", monospace';
        const w = ctx.measureText(text).width + 12;
        ctx.fillStyle = 'rgba(10,15,25,0.9)';
        ctx.fillRect(x - w/2, y - 14, w, 16);
        ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 0.5;
        ctx.strokeRect(x - w/2, y - 14, w, 16);
        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y - 3);
        ctx.textAlign = 'left';
    }

    spawnVictoryParticles() {
        for(let i=0; i<30; i++) {
            this.victoryParticles.push({
                x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
                y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 12 - 4,
                color: ['#FF1050', '#10A0FF', '#10FF50', '#FFD700', '#FFFFFF'][Math.floor(Math.random()*5)],
                size: 4 + Math.random() * 4,
                life: 3000 + Math.random() * 2000,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.2
            });
        }
    }

    drawDreamTransition(progress) {
        const ctx = this.ctx;
        ctx.fillStyle = `rgba(5, 0, 15, ${progress * 0.8})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.save();
        ctx.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        ctx.rotate(progress * Math.PI * 4);
        ctx.strokeStyle = `rgba(16, 160, 255, ${progress})`;
        ctx.lineWidth = 2 + progress * 5;
        ctx.beginPath();
        for(let i=0; i<100; i++) {
            const r = i * 8 * progress;
            const theta = i * 0.5;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawVictoryAnimation() {
        const ctx = this.ctx;
        // Dim background
        ctx.fillStyle = 'rgba(10, 20, 30, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw particles
        this.victoryParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            p.angle += p.spin;
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });

        // Text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 20;
        ctx.fillText("YOU HAVE BEEN HIRED!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px "Share Tech Mono", monospace';
        ctx.shadowBlur = 10;
        ctx.fillText("Human HR: 'You saved us. The job is yours.'", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        // Blinking continue text
        if (Math.sin(Date.now() / 300) > 0) {
            ctx.fillStyle = '#A0A0A0';
            ctx.font = '16px "Share Tech Mono", monospace';
            ctx.shadowBlur = 0;
            ctx.fillText("Click to return home", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
        }
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
    }
}
