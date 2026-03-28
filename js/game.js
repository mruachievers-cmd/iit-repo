// ============================================
// MAIN GAME LOOP (Interview of Destiny)
// ============================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.lastTime = 0;
        this.state = STATE.MENU;
        this.prevState = STATE.EXPLORE; // for pause/resume

        // Systems
        this.tilemap = new TileMap();
        this.camera = new Camera();
        this.memorySystem = new MemorySystem();
        this.npcs = createNPCs();
        this.dialogue = new DialogueSystem(this.memorySystem);
        this.combat = new CombatSystem();
        this.puzzle = new PuzzleSystem();
        this.tutorial = new TutorialSystem();
        this.renderer = new Renderer(this.ctx);

        // Player (Spawn Home)
        this.player = new Player(10, 8);

        // Events
        this.setupInput();

        window.game = this;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    startGame() {
        document.getElementById('game-wrapper').style.display = 'block';
        this.state = STATE.EXPLORE;

        // Check save state
        if (this.memorySystem.flags.roundsPassed === 1) {
            this.tilemap.switchMap('company');
            this.player.pixelX = 13 * TILE_SIZE; this.player.pixelY = 16 * TILE_SIZE;
        } else if (this.memorySystem.flags.roundsPassed >= 2) {
            this.tilemap.switchMap('company');
            this.player.pixelX = 36 * TILE_SIZE; this.player.pixelY = 15 * TILE_SIZE;
        }

        // Start tutorial for first-time players
        this.tutorial.start();
        this.renderer.triggerTransition();
    }

    resumeGame() {
        document.getElementById('pause-overlay').style.display = 'none';
        this.state = this.prevState;
    }

    pauseGame() {
        if (this.state === STATE.MENU || this.state === STATE.PAUSED) return;
        this.prevState = this.state;
        this.state = STATE.PAUSED;
        document.getElementById('pause-overlay').style.display = 'flex';
    }

    stopGame() {
        document.getElementById('pause-overlay').style.display = 'none';
        document.getElementById('game-wrapper').style.display = 'none';
        document.getElementById('landing-screen').style.display = 'flex';
        this.state = STATE.MENU;
    }

    setupInput() {
        const inputEl = document.getElementById('name-input');
        this.dialogue.init(inputEl);
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && inputEl.value.trim()) {
                this.dialogue.submitTextInput(inputEl.value.trim());
                e.preventDefault(); e.stopPropagation();
            }
        });

        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());

        window.addEventListener('keydown', (e) => {
            // Escape for pause
            if (e.code === 'Escape') {
                if (this.state === STATE.PAUSED) this.resumeGame();
                else this.pauseGame();
                return;
            }

            if (this.state === STATE.MENU || this.state === STATE.PAUSED) return;

            if (this.state === STATE.DIALOGUE && this.dialogue.waitingForText) {
                if (document.activeElement !== inputEl) inputEl.focus();
                return;
            }
            if (document.activeElement === inputEl) return;
            this.keys[e.code] = true;
            this.handleKeyDown(e.code);
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
            this.mousePos.y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.keys['LeftClick'] = true;
            if (e.button === 2) this.keys['RightClick'] = true;
            if (this.state === STATE.DIALOGUE) this.dialogue.handleKey('Click');
            if (this.state === STATE.PUZZLE) this.puzzle.handleClick(this.mousePos.x, this.mousePos.y);
            if (this.state === STATE.ENDING || this.state === STATE.GAMEOVER) {
                this.memorySystem.clearAll();
                location.reload();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.keys['LeftClick'] = false;
            if (e.button === 2) this.keys['RightClick'] = false;
        });
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    handleKeyDown(code) {
        // Tutorial advance
        if (this.tutorial.active && (code === 'KeyE' || code === 'Enter')) {
            if (this.tryInteract()) return;
            this.tutorial.advance();
            return;
        }
        if (this.state === STATE.DIALOGUE) this.dialogue.handleKey(code);
        if (this.state === STATE.EXPLORE && (code === 'KeyE' || code === 'Enter')) this.tryInteract();
    }

    tryInteract() {
        const facing = this.player.getFacingTile();
        let dx = facing.x - this.player.gridX;
        let dy = facing.y - this.player.gridY;

        let interactTargets = [{x: facing.x, y: facing.y}];
        let tx = facing.x, ty = facing.y;
        for (let i = 0; i < 2; i++) {
            const tile = this.tilemap.getTile(ty, tx);
            if (tile === T.TABLE || tile === T.DESK || tile === T.RECEPTION || tile === T.GLASS_WALL) {
                tx += dx; ty += dy;
                interactTargets.push({x: tx, y: ty});
            } else break;
        }

        for (const target of interactTargets) {
            for (const npc of this.npcs) {
                if (!npc.active || npc.map !== this.tilemap.currentMap) continue;
                if (npc.gridX === target.x && npc.gridY === target.y) {
                    this.state = STATE.DIALOGUE;
                    this.dialogue.start(npc, this.player);
                    return true;
                }
            }
        }

        if (this.tilemap.isDoor(facing.y, facing.x) || this.tilemap.isDoor(this.player.gridY, this.player.gridX)) {
            if (this.tilemap.currentMap === 'home') {
                this.renderer.triggerTransition();
                this.tilemap.switchMap('company');
                this.player.gridX = 24; this.player.gridY = 32;
                this.player.pixelX = 24 * TILE_SIZE; this.player.pixelY = 32 * TILE_SIZE;
                return true;
            } else if (this.tilemap.currentMap === 'company' && facing.y > 30) {
                this.state = STATE.DIALOGUE;
                this.dialogue.start(new NPC({ id: 'sign', name: 'Sign', type: 'sign' }), this.player);
                this.dialogue.addLine("Can't go back home yet. Gotta find a job...");
                return true;
            } else if (this.tilemap.currentMap === 'company' && facing.y === 20 && facing.x === 24) {
                if (this.memorySystem.flags.roundsPassed === 0) {
                    this.state = STATE.DIALOGUE;
                    this.dialogue.start(new NPC({ id: 'sign', name: 'Sign', type: 'sign' }), this.player);
                    this.dialogue.addLine("ACCESS DENIED. Round 1 Not Cleared.");
                    return true;
                } else if (this.memorySystem.flags.roundsPassed === 1 && !this.memorySystem.flags.hasKeycard) {
                    this.state = STATE.DIALOGUE;
                    this.dialogue.start(new NPC({ id: 'sign', name: 'Sign', type: 'sign' }), this.player);
                    this.dialogue.addLine("LOCKED. Please swipe Server Room Keycard to enter.");
                    return true;
                } else if (this.memorySystem.flags.roundsPassed === 1 && this.memorySystem.flags.hasKeycard) {
                    this.state = STATE.DIALOGUE;
                    this.dialogue.start(new NPC({ id: 'sign', name: 'Sign', type: 'sign' }), this.player);
                    this.dialogue.addLine("The keycard works! But the main terminal is offline...");
                    this.dialogue.addLine("Look around the corridor. Maybe there's a hidden access point near the plants.");
                    return true;
                } else {
                    this.state = STATE.DIALOGUE;
                    this.dialogue.start(new NPC({ id: 'sign', name: 'Sign', type: 'sign' }), this.player);
                    this.dialogue.addLine("The puzzle terminal is already decrypted.");
                    return true;
                }
            }
        }
        return false;
    }

    startBattleAction(bossId) {
        this.state = STATE.BATTLE_ACTION;
        this.renderer.triggerTransition();
        this.tilemap.switchMap('arena');
        this.player.pixelX = 20 * TILE_SIZE;
        this.player.pixelY = 25 * TILE_SIZE;
        this.player.hp = this.player.maxHp;

        this.renderer.triggerGlitch(1.0);

        this.combat.start(bossId, () => {
            this.renderer.triggerGlitch(1.0);
            this.renderer.triggerTransition();
            this.memorySystem.flags.bossesDefeated++;
            this.memorySystem.save();

            if (bossId === 'giant1') {
                this.state = STATE.EXPLORE;
                this.tilemap.switchMap('company');
                this.player.gridX = 28; this.player.gridY = 32;
                this.player.pixelX = 28 * TILE_SIZE; this.player.pixelY = 32 * TILE_SIZE;
            } else if (bossId === 'giant2') {
                this.state = STATE.EXPLORE;
                this.tilemap.switchMap('company');
                this.player.gridX = 36; this.player.gridY = 15;
                this.player.pixelX = 36 * TILE_SIZE; this.player.pixelY = 15 * TILE_SIZE;
            } else if (bossId === 'alien_hr') {
                this.state = STATE.VICTORY_ANIM;
                this.renderer.spawnVictoryParticles();
            }
        }, () => {
            this.state = STATE.GAMEOVER;
        });
    }

    startPuzzle() {
        this.state = STATE.PUZZLE;
        this.renderer.triggerGlitch(0.5);
        this.puzzle.start(() => {
            this.memorySystem.flags.roundsPassed = 2;
            this.memorySystem.save();
            this.startBattleAction('giant2');
        }, () => {
            this.state = STATE.GAMEOVER;
        });
    }

    startDreamSequence() {
        this.dreamTime = 0;
        this.state = STATE.DREAM_TRANSITION;
        this.renderer.triggerShake(30);
    }

    startTreeFightSequence() {
        this.renderer.triggerShake(40);
        this.renderer.triggerGlitch(2.0);
        setTimeout(() => {
            this.startBattleAction('giant2');
        }, 1500);
    }

    restartToRound1() {
        this.state = STATE.EXPLORE;
        this.tilemap.switchMap('company');
        this.player.gridX = 24; this.player.gridY = 28;
        this.player.pixelX = 24 * TILE_SIZE; this.player.pixelY = 28 * TILE_SIZE;
        this.player.hp = this.player.maxHp;
        this.memorySystem.clearFailState();
        this.renderer.triggerGlitch(2.0);
        this.renderer.triggerTransition();
    }

    gameLoop(timestamp) {
        const dt = Math.min(timestamp - this.lastTime, 50);
        this.lastTime = timestamp;
        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        if (this.state === STATE.MENU || this.state === STATE.PAUSED) return;

        this.renderer.update(dt);
        this.camera.update(dt);

        if (this.state === STATE.GAMEOVER && this.keys['Enter']) {
            this.restartToRound1();
        }

        if (this.state === STATE.EXPLORE) {
            this.player.updateExplore(dt, this.keys, this.tilemap, this.npcs);
            this.camera.follow(this.player.pixelX, this.player.pixelY);
            this.player.gridX = Math.round(this.player.pixelX / TILE_SIZE);
            this.player.gridY = Math.round(this.player.pixelY / TILE_SIZE);

            // Toggle item visibility
            const hintNote = this.npcs.find(n => n.id === 'hint_note');
            const keycard = this.npcs.find(n => n.id === 'server_keycard');
            const serverTree = this.npcs.find(n => n.id === 'server_tree');
            if (this.memorySystem.flags.roundsPassed === 1 && !this.memorySystem.flags.hasKeycard) {
                if (hintNote) hintNote.active = true;
                if (keycard) keycard.active = true;
                if (serverTree) serverTree.active = false;
            } else if (this.memorySystem.flags.roundsPassed === 1 && this.memorySystem.flags.hasKeycard) {
                if (hintNote) hintNote.active = false;
                if (keycard) keycard.active = false;
                if (serverTree) serverTree.active = true;
            } else {
                if (hintNote) hintNote.active = false;
                if (keycard) keycard.active = false;
                if (serverTree) serverTree.active = false;
            }

            // Dynamic Uncle Arjun (Senior Dev) repositioning
            const uncle = this.npcs.find(n => n.id === 'senior_dev');
            if (uncle && this.tilemap.currentMap === 'company') {
                uncle.active = true;
                if (this.memorySystem.flags.roundsPassed === 0) {
                    // At entrance lobby
                    uncle.gridX = 22; uncle.gridY = 31;
                } else if (this.memorySystem.flags.roundsPassed === 1 && !this.memorySystem.flags.hasKeycard) {
                    // Near GD room after Round 1
                    uncle.gridX = 16; uncle.gridY = 22;
                } else if (this.memorySystem.flags.roundsPassed === 1 && this.memorySystem.flags.hasKeycard) {
                    // Near the corridor plants
                    uncle.gridX = 18; uncle.gridY = 22;
                } else if (this.memorySystem.flags.roundsPassed >= 2) {
                    // Near HR room entrance
                    uncle.gridX = 32; uncle.gridY = 22;
                }
                uncle.pixelX = uncle.gridX * TILE_SIZE;
                uncle.pixelY = uncle.gridY * TILE_SIZE;
            } else if (uncle && this.tilemap.currentMap !== 'company') {
                uncle.active = false;
            }

            this.npcs.forEach(npc => npc.update());
            this.tutorial.update(dt);
        }

        if (this.state === STATE.BATTLE_ACTION) {
            const cam = this.camera.getOffset();
            this.player.updateCombat(dt, this.keys, this.mousePos, cam.x, cam.y);
            this.camera.follow(this.player.pixelX, this.player.pixelY);
            this.combat.update(dt, this.player);

            if (this.player.isAttacking && this.player.attackTimer === 150) this.camera.shake(5);
            if (this.player.iframes === 500) {
                this.camera.shake(15);
                this.renderer.triggerGlitch(0.3);
            }
        }

        if (this.state === STATE.DIALOGUE) {
            this.dialogue.update(dt);
            if (!this.dialogue.active) this.state = STATE.EXPLORE;
        }

        if (this.state === STATE.DREAM_TRANSITION) {
            this.dreamTime += dt;
            if (this.dreamTime > 3000) {
                this.startBattleAction('giant1');
            }
            this.renderer.update(dt);
        }

        if (this.state === STATE.VICTORY_ANIM) {
            this.renderer.update(dt);
            if (this.keys['Enter'] || this.keys['LeftClick']) {
                this.state = STATE.MENU;
                this.memorySystem.clearAll();
                location.reload();
            }
        }

        if (this.state === STATE.PUZZLE) {
            this.puzzle.update(dt);
        }
    }

    draw() {
        if (this.state === STATE.MENU) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const cam = this.camera.getOffset();

        if (this.state === STATE.EXPLORE || this.state === STATE.DIALOGUE || this.state === STATE.BATTLE_ACTION) {
            this.renderer.drawMap(this.tilemap, this.camera);

            // NPCs
            if (this.state !== STATE.BATTLE_ACTION) {
                this.npcs.forEach(e => {
                    if (e.active && e.map === this.tilemap.currentMap) {
                        e.draw(ctx, cam.x, cam.y);
                        if (e.isAdjacentTo(this.player.gridX, this.player.gridY)) {
                            this.renderer.drawInteractionIndicator(ctx, e, cam.x, cam.y);
                        }
                    }
                });
            }

            // Boss
            if (this.state === STATE.BATTLE_ACTION) {
                this.combat.draw(ctx, cam.x, cam.y);
            }

            // Player
            this.player.draw(ctx, cam.x, cam.y);

            // Arena edge fade
            if (this.state === STATE.BATTLE_ACTION) {
                ctx.fillStyle = 'rgba(26,0,26,0.5)';
                ctx.fillRect(0, 0, CANVAS_WIDTH, 10);
                ctx.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
                ctx.fillRect(0, 0, 10, CANVAS_HEIGHT);
                ctx.fillRect(CANVAS_WIDTH - 10, 0, 10, CANVAS_HEIGHT);
            }

            // Ambient particles
            this.renderer.drawAmbientParticles();
        }

        // Glitch
        this.renderer.drawGlitchEffect();

        // UI Layer
        if (this.state === STATE.DREAM_TRANSITION) {
            this.renderer.drawDreamTransition(Math.min(1.0, this.dreamTime / 3000));
        }

        if (this.state === STATE.VICTORY_ANIM) {
            this.renderer.drawVictoryAnimation();
        }

        if (this.state === STATE.DIALOGUE) {
            this.dialogue.draw(ctx);
        } else if (this.state === STATE.PUZZLE) {
            this.puzzle.draw(ctx);
        } else if (this.state === STATE.EXPLORE || this.state === STATE.BATTLE_ACTION) {
            this.renderer.drawHUD(this.player, this.state, this.combat);
        }

        // Mini-Map (top-right, only in explore/dialogue)
        if (this.state === STATE.EXPLORE || this.state === STATE.DIALOGUE) {
            this.renderer.drawMiniMap(this.tilemap, this.player, this.npcs);
        }

        // Tutorial (on top of everything)
        if (this.state === STATE.EXPLORE) {
            this.tutorial.draw(ctx);
        }

        // Transition effect
        this.renderer.drawTransition();

        // Game Over
        if (this.state === STATE.GAMEOVER) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = COLORS.NEON_RED;
            ctx.font = '40px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText("CANDIDATE REJECTED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.font = '20px "Share Tech Mono", monospace';
            ctx.fillText("Click to Try Again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
            ctx.textAlign = 'left';
        }

        // Ending
        if (this.state === STATE.ENDING) {
            ctx.fillStyle = 'rgba(255,255,255,1)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#000000';
            ctx.font = '30px "Share Tech Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText("YOU SAVED US.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
            ctx.font = '20px "Share Tech Mono", monospace';
            ctx.fillText("You didn't just pass an interview.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
            ctx.fillText("You proved your worth.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
            ctx.font = '14px "Share Tech Mono", monospace';
            ctx.fillText("Click to return home.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
            ctx.textAlign = 'left';
        }

        // Paused dim (handled by CSS overlay, but draw dim on canvas too)
        if (this.state === STATE.PAUSED) {
            ctx.fillStyle = 'rgba(0,0,10,0.5)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => new Game());
