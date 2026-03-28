// ============================================
// REAL-TIME COMBAT ENGINE (Interview of Destiny)
// ============================================
class CombatSystem {
    constructor() {
        this.active = false;
        this.boss = null;
        this.particles = [];
        this.onWin = null;
        this.onLose = null;

        // Load boss sprites and dynamically remove background
        this.giantSpriteCanvas = null;
        this.alienSpriteCanvas = null;

        const giantImg = new Image();
        giantImg.onload = () => this.giantSpriteCanvas = this.removeImageBackground(giantImg);
        giantImg.src = 'giant_boss.png';

        const alienImg = new Image();
        alienImg.onload = () => this.alienSpriteCanvas = this.removeImageBackground(alienImg);
        alienImg.src = 'alien_hr.png';
    }

    removeImageBackground(img) {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        
        try {
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const data = imgData.data;
            // Get background color from top-left pixel
            const bgR = data[0], bgG = data[1], bgB = data[2];
            const tolerance = 40; // High tolerance for AI generated JPEGy artifacts
            
            for (let i = 0; i < data.length; i += 4) {
                // If pixel is close to background color, make it transparent
                if (Math.abs(data[i] - bgR) < tolerance && 
                    Math.abs(data[i+1] - bgG) < tolerance && 
                    Math.abs(data[i+2] - bgB) < tolerance) {
                    data[i+3] = 0; // Alpha = 0
                }
            }
            ctx.putImageData(imgData, 0, 0);
        } catch(e) {
            console.error("CORS issue reading image data", e);
        }
        return c;
    }

    start(bossType, onWin, onLose) {
        this.active = true;
        this.onWin = onWin;
        this.onLose = onLose;
        this.particles = [];

        // Center boss
        const cx = 20 * TILE_SIZE;
        const cy = 15 * TILE_SIZE;

        if (bossType === 'giant1') {
            this.boss = {
                id: 'giant1',
                name: 'INTERVIEW GUARDIAN',
                x: cx, y: cy,
                hp: 50000, maxHp: 50000,
                radius: 40,
                state: 'idle',
                timer: 0,
                color: '#6080A0'
            };
            this.survivedTime = 0;
            this.survivalTarget = 30000;
        } else if (bossType === 'giant2') {
            this.boss = {
                id: 'giant2',
                name: 'SECURITY BRUTE',
                x: cx, y: cy,
                hp: 100000, maxHp: 100000,
                radius: 35,
                state: 'idle',
                timer: 0,
                color: '#A04040'
            };
            this.survivedTime = 0;
            this.survivalTarget = 30000;
        } else if (bossType === 'alien_hr') {
            this.boss = {
                id: 'alien_hr',
                name: 'HR OVERLORD',
                x: cx, y: cy,
                hp: 2000, maxHp: 2000,
                radius: 30,
                state: 'idle',
                timer: 0,
                color: COLORS.NEON_RED,
                projectiles: []
            };
        }
    }

    update(dt, player) {
        if (!this.active || !this.boss) return;

        // Player Attack Hitbox Check
        if (player.isAttacking && player.attackTimer > 100) { // Only hit on first frame of swing
            const dx = this.boss.x - player.pixelX;
            const dy = this.boss.y - player.pixelY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Check if near boss (Removed strict mouse-aim angle since player is using keyboard Spacebar)
            if (dist < 120) {
                // Hit!
                this.boss.hp -= 50; // Increased damage, boss dies in 10 hits
                player.attackTimer = 99; // Prevent multi-hit
                this.spawnParticles(this.boss.x, this.boss.y, '#FFFFFF');

                if (this.boss.hp <= 0) {
                    this.active = false;
                    if (this.onWin) this.onWin();
                    return;
                }
            }
        }

        // --- BOSS AI ---
        const b = this.boss;
        b.timer -= dt;

        const distToPlayer = Math.sqrt((player.pixelX - b.x) ** 2 + (player.pixelY - b.y) ** 2);

        if (b.id === 'giant1' || b.id === 'giant2') {
            this.survivedTime += dt;
            if (this.survivedTime >= this.survivalTarget) {
                this.active = false;
                if (this.onWin) this.onWin();
                return;
            }

            const speed = b.id === 'giant1' ? 1.5 : 2.5;

            if (b.state === 'idle') {
                if (b.timer <= 0) {
                    b.state = 'chase';
                    b.timer = Math.random() * 2000 + 1000;
                }
            } else if (b.state === 'chase') {
                // Move towards player
                if (distToPlayer > b.radius + 10) {
                    b.x += ((player.pixelX - b.x) / distToPlayer) * speed;
                    b.y += ((player.pixelY - b.y) / distToPlayer) * speed;
                }

                if (distToPlayer < 100 && b.timer <= 0) {
                    b.state = 'windup';
                    b.timer = 800; // 0.8s telegraph
                }
            } else if (b.state === 'windup') {
                if (b.timer <= 0) {
                    b.state = 'attack';
                    b.timer = 300;
                    // Slam Attack! Check hit
                    if (distToPlayer < 120) {
                        player.takeDamage(20);
                        if (player.hp <= 0 && this.onLose) this.onLose();
                    }
                }
            } else if (b.state === 'attack') {
                if (b.timer <= 0) {
                    b.state = 'idle';
                    b.timer = 1000;
                }
            }
        } else if (b.id === 'alien_hr') {
            // Alien HR uses teleports and projectiles
            if (b.state === 'idle') {
                if (b.timer <= 0) {
                    b.state = Math.random() > 0.5 ? 'shoot' : 'teleport_windup';
                    b.timer = 500;
                }
            } else if (b.state === 'shoot') {
                if (b.timer <= 0) {
                    // Fire ring of projectiles
                    for (let i = 0; i < 8; i++) {
                        const angle = (Math.PI / 4) * i;
                        b.projectiles.push({
                            x: b.x, y: b.y,
                            vx: Math.cos(angle) * 4,
                            vy: Math.sin(angle) * 4
                        });
                    }
                    b.state = 'idle';
                    b.timer = 1500;
                }
            } else if (b.state === 'teleport_windup') {
                if (b.timer <= 0) {
                    // Teleport near player
                    b.x = player.pixelX + (Math.random() * 200 - 100);
                    b.y = player.pixelY + (Math.random() * 200 - 100);
                    b.state = 'slam_windup';
                    b.timer = 600;
                }
            } else if (b.state === 'slam_windup') {
                if (b.timer <= 0) {
                    // Giant AoE
                    if (distToPlayer < 150) {
                        player.takeDamage(40);
                        if (player.hp <= 0 && this.onLose) this.onLose();
                    }
                    b.state = 'idle';
                    b.timer = 1000;
                }
            }

            // Update projectiles
            for (let i = b.projectiles.length - 1; i >= 0; i--) {
                const p = b.projectiles[i];
                p.x += p.vx;
                p.y += p.vy;
                const pDist = Math.sqrt((player.pixelX - p.x) ** 2 + (player.pixelY - p.y) ** 2);
                if (pDist < 20) {
                    player.takeDamage(15);
                    b.projectiles.splice(i, 1);
                    if (player.hp <= 0 && this.onLose) this.onLose();
                } else if (p.x < 0 || p.x > CANVAS_WIDTH * 2 || p.y < 0 || p.y > CANVAS_HEIGHT * 2) {
                    b.projectiles.splice(i, 1);
                }
            }
        }

        // Clamp boss to arena
        b.x = Math.max(TILE_SIZE * 2, Math.min(CANVAS_WIDTH * 2 - TILE_SIZE * 2, b.x));
        b.y = Math.max(TILE_SIZE * 2, Math.min(CANVAS_HEIGHT * 2 - TILE_SIZE * 2, b.y));

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 300,
                color
            });
        }
    }

    draw(ctx, camX, camY) {
        if (!this.active || !this.boss) return;

        const b = this.boss;
        const px = Math.round(b.x - camX);
        const py = Math.round(b.y - camY);

        // Draw telegraphs
        if (b.state === 'windup' || b.state === 'slam_windup') {
            ctx.fillStyle = 'rgba(255, 16, 80, 0.3)';
            ctx.beginPath();
            const radius = b.id === 'alien_hr' ? 150 : 120;
            ctx.arc(px, py, radius * (1 - b.timer / (b.id === 'alien_hr' ? 600 : 800)), 0, Math.PI * 2);
            ctx.fill();

            // Outline
            ctx.strokeStyle = COLORS.NEON_RED;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw Boss
        let bob = Math.sin(Date.now() / 200) * 5;
        if (b.state === 'attack' || b.state === 'slam') bob = -10;

        // If 'alien_hr' and sprite is loaded
        if (b.id === 'alien_hr') {
            if (this.alienSpriteCanvas) {
                ctx.drawImage(this.alienSpriteCanvas, px - 64, py - 64 + bob, 128, 128);
            } else {
                // Fallback rendering
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.moveTo(px, py - 40 + bob);
                ctx.lineTo(px - 30, py + 20 + bob);
                ctx.lineTo(px, py + 40 + bob);
                ctx.lineTo(px + 30, py + 20 + bob);
                ctx.fill();
                ctx.fillStyle = COLORS.WALL;
                ctx.beginPath(); ctx.arc(px, py + bob, 10, 0, Math.PI * 2); ctx.fill();
            }

            // Projectiles
            if (b.projectiles) {
                ctx.fillStyle = COLORS.NEON_BLUE;
                b.projectiles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x - camX, p.y - camY, 6, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
        } else {
            // Draw Giant ('giant1', 'giant2')
            if (this.giantSpriteCanvas) {
                ctx.drawImage(this.giantSpriteCanvas, px - 64, py - 64 + bob, 128, 128);
            } else {
                // Fallback rendering
                ctx.fillStyle = b.color;
                ctx.fillRect(px - b.radius, py - b.radius + bob, b.radius * 2, b.radius * 2);
                ctx.fillStyle = COLORS.NEON_RED;
                ctx.fillRect(px - 15, py - 10 + bob, 30, 8);
            }
        }

        // Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - camX, p.y - camY, 4, 4);
        });

        // Draw Timer
        if (b.id === 'giant1' || b.id === 'giant2') {
            const timeLeft = Math.max(0, Math.ceil((this.survivalTarget - this.survivedTime) / 1000));
            ctx.fillStyle = '#FFFFFF';
            // Scale and stroke to make it visible
            ctx.font = 'bold 24px "Courier New"';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.strokeText(`Survive! ${timeLeft}s`, CANVAS_WIDTH / 2, 50);
            ctx.fillText(`Survive! ${timeLeft}s`, CANVAS_WIDTH / 2, 50);
        }
    }
}
