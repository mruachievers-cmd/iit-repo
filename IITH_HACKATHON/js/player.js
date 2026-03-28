// ============================================
// PLAYER CONTROLLER (Enhanced with directional face)
// ============================================
class Player {
    constructor(startX, startY) {
        this.gridX = startX;
        this.gridY = startY;
        this.pixelX = startX * TILE_SIZE;
        this.pixelY = startY * TILE_SIZE;
        this.moving = false;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        this.direction = DIR.DOWN;

        this.hp = 100; this.maxHp = 100;
        this.stamina = 100; this.maxStamina = 100;

        this.isDodging = false; this.dodgeTimer = 0;
        this.isAttacking = false; this.attackTimer = 0;
        this.attackCooldown = 0;
        this.iframes = 0;
        this.aimAngle = 0;

        this.frame = 0; this.frameTimer = 0;
        this.sprite = new Image();
        this.sprite.src = 'player.png';
    }

    updateExplore(dt, keys, tilemap, npcs) {
        if (!this.moving) {
            let dx = 0, dy = 0;
            if (keys['KeyW'] || keys['ArrowUp']) { dy = -1; this.direction = DIR.UP; }
            else if (keys['KeyS'] || keys['ArrowDown']) { dy = 1; this.direction = DIR.DOWN; }
            else if (keys['KeyA'] || keys['ArrowLeft']) { dx = -1; this.direction = DIR.LEFT; }
            else if (keys['KeyD'] || keys['ArrowRight']) { dx = 1; this.direction = DIR.RIGHT; }

            if (dx !== 0 || dy !== 0) {
                const nextX = this.gridX + dx;
                const nextY = this.gridY + dy;
                if (!tilemap.isSolid(nextY, nextX) && !this.isNPCAt(nextX, nextY, npcs, tilemap.currentMap)) {
                    this.gridX = nextX; this.gridY = nextY;
                    this.targetX = this.gridX * TILE_SIZE;
                    this.targetY = this.gridY * TILE_SIZE;
                    this.moving = true;
                }
            }
        } else {
            const speed = MOVE_SPEED;
            const pdx = this.targetX - this.pixelX;
            const pdy = this.targetY - this.pixelY;
            const dist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (dist <= speed) {
                this.pixelX = this.targetX; this.pixelY = this.targetY; this.moving = false;
            } else {
                this.pixelX += (pdx / dist) * speed;
                this.pixelY += (pdy / dist) * speed;
            }
        }
    }

    isNPCAt(gx, gy, npcs, cMap) {
        return npcs.some(n => n.active && n.map === cMap && n.gridX === gx && Math.round(n.pixelY / TILE_SIZE) === gy);
    }

    getFacingTile() {
        let fx = this.gridX, fy = this.gridY;
        if (this.direction === DIR.UP) fy--;
        else if (this.direction === DIR.DOWN) fy++;
        else if (this.direction === DIR.LEFT) fx--;
        else if (this.direction === DIR.RIGHT) fx++;
        return { x: fx, y: fy };
    }

    updateCombat(dt, keys, mousePos, camX, camY) {
        if (!this.isDodging && !this.isAttacking) {
            this.stamina = Math.min(this.maxStamina, this.stamina + dt * 0.05);
        }
        if (this.iframes > 0) this.iframes -= dt;
        if (this.isDodging) { this.dodgeTimer -= dt; if (this.dodgeTimer <= 0) this.isDodging = false; }
        if (this.isAttacking) { this.attackTimer -= dt; if (this.attackTimer <= 0) this.isAttacking = false; }
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        const screenCenterX = this.pixelX - camX + TILE_SIZE / 2;
        const screenCenterY = this.pixelY - camY + TILE_SIZE / 2;
        this.aimAngle = Math.atan2(mousePos.y - screenCenterY, mousePos.x - screenCenterX);

        if (!this.isDodging && !this.isAttacking) {
            let dx = 0, dy = 0;
            if (keys['KeyW'] || keys['ArrowUp']) { dy = -1; this.direction = DIR.UP; }
            if (keys['KeyS'] || keys['ArrowDown']) { dy = 1; this.direction = DIR.DOWN; }
            if (keys['KeyA'] || keys['ArrowLeft']) { dx = -1; this.direction = DIR.LEFT; }
            if (keys['KeyD'] || keys['ArrowRight']) { dx = 1; this.direction = DIR.RIGHT; }

            if (dx !== 0 || dy !== 0) {
                this.moving = true;
                const len = Math.sqrt(dx * dx + dy * dy);
                this.pixelX += (dx / len) * 4;
                this.pixelY += (dy / len) * 4;
            } else { this.moving = false; }

            if ((keys['ShiftLeft'] || keys['RightClick']) && this.stamina >= 25 && (dx !== 0 || dy !== 0)) {
                this.isDodging = true; this.dodgeTimer = 300; this.iframes = 300; this.stamina -= 25;
                this.dodgeDir = { x: dx / Math.sqrt(dx*dx+dy*dy), y: dy / Math.sqrt(dx*dx+dy*dy) };
            }
            if ((keys['LeftClick'] || keys['Space']) && this.attackCooldown <= 0 && this.stamina >= 10) {
                this.isAttacking = true; this.attackTimer = 150; this.attackCooldown = 300; this.stamina -= 10;
            }
        }
        if (this.isDodging) {
            this.pixelX += this.dodgeDir.x * 8;
            this.pixelY += this.dodgeDir.y * 8;
        }
        this.pixelX = Math.max(TILE_SIZE, Math.min(CANVAS_WIDTH * 2, this.pixelX));
        this.pixelY = Math.max(TILE_SIZE, Math.min(CANVAS_HEIGHT * 2, this.pixelY));
    }

    takeDamage(amt) {
        if (this.iframes > 0) return false;
        this.hp -= amt; this.iframes = 500;
        return true;
    }

    draw(ctx, camX, camY) {
        const px = Math.round(this.pixelX - camX);
        const py = Math.round(this.pixelY - camY);
        if (this.iframes > 0 && Math.floor(Date.now() / 50) % 2 === 0) return;

        ctx.save();
        const S = TILE_SIZE;

        // Animation frame update
        if (this.moving) {
            this.frameTimer++;
            if (this.frameTimer > 8) { this.frame++; if (this.frame > 3) this.frame = 0; this.frameTimer = 0; }
        } else { this.frame = 0; }

        // Try sprite sheet first
        if (this.sprite.complete && this.sprite.naturalWidth > 0) {
            ctx.drawImage(this.sprite, this.frame * 32, this.direction * 32, 32, 32, px, py, 32, 32);
        } else {
            // Enhanced fallback pixel-art character
            let bob = 0;
            if (this.moving && !this.isDodging) bob = Math.sin(Date.now() / 150) * 2;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath(); ctx.ellipse(px + S/2, py + S - 2, 8, 3, 0, 0, Math.PI*2); ctx.fill();

            // Walk animation leg shift
            const legShift = this.moving ? Math.sin(Date.now() / 100) * 2 : 0;

            // Legs
            ctx.fillStyle = '#103060';
            ctx.fillRect(px + 8 + legShift, py + 22 + bob, 5, 8);
            ctx.fillRect(px + 19 - legShift, py + 22 + bob, 5, 8);

            // Shoes
            ctx.fillStyle = '#202020';
            ctx.fillRect(px + 7 + legShift, py + 28 + bob, 7, 3);
            ctx.fillRect(px + 18 - legShift, py + 28 + bob, 7, 3);

            // Body (shirt)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(px + 6, py + 10 + bob, 20, 14);
            // Jacket lapels
            ctx.fillStyle = '#304060';
            ctx.fillRect(px + 6, py + 10 + bob, 4, 14);
            ctx.fillRect(px + 22, py + 10 + bob, 4, 14);

            // Tie
            ctx.fillStyle = COLORS.NEON_RED;
            ctx.fillRect(px + S/2 - 1, py + 10 + bob, 3, 12);
            ctx.fillRect(px + S/2 - 2, py + 10 + bob, 5, 3);

            // Head
            ctx.fillStyle = '#FFC0A0';
            ctx.fillRect(px + 8, py + 1 + bob, 16, 12);
            ctx.beginPath(); ctx.arc(px + S/2, py + 4 + bob, 8, Math.PI, 0); ctx.fill();

            // Hair
            ctx.fillStyle = '#402010';
            if (this.direction === DIR.UP) {
                ctx.fillRect(px + 8, py + 1 + bob, 16, 6);
            } else {
                ctx.fillRect(px + 8, py + bob, 16, 4);
                ctx.fillRect(px + 7, py + 1 + bob, 2, 6);
                ctx.fillRect(px + 23, py + 1 + bob, 2, 6);
            }

            // Eyes (directional)
            if (this.direction !== DIR.UP) {
                ctx.fillStyle = '#FFFFFF';
                let eyeOffX = 0;
                if (this.direction === DIR.LEFT) eyeOffX = -2;
                if (this.direction === DIR.RIGHT) eyeOffX = 2;
                ctx.fillRect(px + 10 + eyeOffX, py + 5 + bob, 4, 4);
                ctx.fillRect(px + 18 + eyeOffX, py + 5 + bob, 4, 4);
                // Pupils
                ctx.fillStyle = '#000000';
                let pupilOff = 0;
                if (this.direction === DIR.LEFT) pupilOff = -1;
                if (this.direction === DIR.RIGHT) pupilOff = 1;
                ctx.fillRect(px + 11 + eyeOffX + pupilOff, py + 6 + bob, 2, 2);
                ctx.fillRect(px + 19 + eyeOffX + pupilOff, py + 6 + bob, 2, 2);
            }

            // Arms
            ctx.fillStyle = '#FFC0A0';
            if (this.direction === DIR.LEFT) {
                ctx.fillRect(px + 4, py + 12 + bob, 4, 8);
            } else if (this.direction === DIR.RIGHT) {
                ctx.fillRect(px + 24, py + 12 + bob, 4, 8);
            } else {
                ctx.fillRect(px + 4, py + 12 + bob, 4, 8);
                ctx.fillRect(px + 24, py + 12 + bob, 4, 8);
            }
        }

        // Combat visual (Sword)
        if (window.game && window.game.state === STATE.BATTLE_ACTION) {
            ctx.fillStyle = '#E0F0FF';
            if (this.isAttacking) {
                ctx.save();
                ctx.translate(px + S/2, py + S/2);
                ctx.rotate(-Math.PI / 4);
                ctx.fillRect(8, -24, 4, 32);
                ctx.fillStyle = 'rgba(64, 160, 255, 0.5)';
                ctx.beginPath(); ctx.arc(0, 0, 30, -Math.PI, 0); ctx.lineTo(0, 0); ctx.fill();
                ctx.restore();
            } else {
                ctx.fillRect(px + S + 2, py + 8, 4, 20);
            }
        }

        ctx.restore();
    }
}
