// ============================================
// DIALOGUE SYSTEM & ROUND 1 LOGIC
// ============================================
class DialogueSystem {
    constructor(memorySystem) {
        this.memory = memorySystem;
        this.active = false;
        this.currentNPC = null;
        this.lines = [];
        this.currentLine = 0;
        this.displayedText = '';
        this.fullText = '';
        this.charIndex = 0;
        this.typeSpeed = 30;
        this.typeTimer = 0;
        this.waitingForInput = false;
        this.waitingForText = false;
        this.choices = null;
        this.selectedChoice = 0;
        this.portraitAnim = 0;
        this.inputEl = null;
    }

    init(inputElement) { this.inputEl = inputElement; }

    start(npc, player) {
        this.active = true;
        this.currentNPC = npc;
        this.lines = [];
        this.currentLine = 0;
        this.choices = null;
        if (npc) npc.facePlayer(player);
        this.buildDialogue(npc);
        this.processNextLine();
    }

    buildDialogue(npc) {
        const mem = this.memory.getMemory(npc.id);
        const name = this.memory.getPlayerName();
        const hasJob = this.memory.flags.hasJob;

        switch (npc.type) {
            case 'mother':
                if (hasJob) {
                    this.addLine("You got the job?! I'm so proud of you!");
                } else {
                    this.addLine("Wake up! You need to go find a job.");
                    this.addLine("The COMPANY skyscraper is just outside. Don't come back until you're hired!");
                }
                break;
            case 'receptionist':
                if (!name) {
                    this.addLine("Welcome to COMPANY. The world's leading enterprise.");
                    this.addTextInput("What is your name, candidate?", (input) => {
                        this.memory.setPlayerName(input);
                        this.addLine(`Ah, ${input}. You are scheduled for Round 1: Group Discussion.`);
                        this.addLine("Please proceed through the double doors and find Room A on the left.");
                        this.processNextLine();
                    });
                } else {
                    this.addLine(`Welcome back, ${name}. Room A is down the hall to the left.`);
                }
                break;
            case 'candidate':
                if (npc.id === 'nervousC') {
                    this.addLine("*fidgets with tie*");
                    this.addLine("I studied for 3 months and I STILL feel unprepared!");
                    this.addLine("Please tell me you're also nervous...");
                } else if (npc.id === 'confidentD') {
                    this.addLine("Pfft, easy. I'll be CEO by next quarter.");
                    this.addLine("I already have three backup offers. This is just practice.");
                } else if (npc.id === 'candidate1') {
                    this.addLine("Hi, I'm Alice. Have you met the Moderator yet?");
                    this.addLine("He seems... intense. I heard he failed 90% of candidates last round.");
                } else if (npc.id === 'candidateB') {
                    this.addLine("I'm Bob. Don't try to be too clever in there.");
                    this.addLine("The Moderator values authenticity over showmanship.");
                } else {
                    this.addLine("I'm so nervous... I heard they actually eat the candidates who fail.");
                    this.addLine("Haha, just a corporate rumor, right? ...Right?");
                }
                break;
            case 'moderator':
                if (!name) {
                    this.addLine("You haven't checked in with Reception. Leave.");
                } else if (this.memory.flags.roundsPassed >= 1) {
                    this.addLine("You passed my evaluation. Proceed to the Server Room for Round 2.");
                } else if (this.memory.flags.roundFailed) {
                    this.addLine("You were rejected. The exit is behind you.");
                } else {
                    this.addLine(`Candidate ${name}, take your seat. The Group Discussion begins now.`);
                    this.startGroupDiscussion();
                }
                break;
            case 'hr':
                if (this.memory.flags.bossesDefeated >= 2) {
                    this.startHRTwist(name);
                } else {
                    this.addLine("You shouldn't be here yet. The Executive Office is off limits.");
                }
                break;
            case 'sign':
                this.addLine(npc.name); // Custom text for doors/signs
                break;
            case 'note':
                this.addLine("[SYSTEM NOTE]: The Server Room Keycard was dropped near the Lobby Reception.");
                this.addLine("Find it to unlock the glass doors located directly north of the Reception.");
                break;
            case 'keycard':
                this.addLine("You picked up the **SERVER ROOM KEYCARD**!");
                this.memory.flags.hasKeycard = true;
                this.memory.save();
                npc.active = false;
                break;
            case 'father':
                if (hasJob) {
                    this.addLine("I knew you had it in you. Let's celebrate!");
                } else {
                    this.addLine("Good luck out there, champ. Make us proud.");
                    this.addLine("Remember: confidence is key. Even if you're faking it.");
                }
                break;
            case 'guard':
                this.addLine("Badge first, questions later.");
                this.addLine("Reception is straight ahead. Don't touch anything on the way.");
                break;
            case 'janitor':
                this.addLine("*mops the floor slowly*");
                this.addLine("I've seen things in this building... things that aren't in the job description.");
                this.addLine("Last batch of candidates? Well, let's just say... the exit wasn't the door they expected.");
                break;
            case 'employee':
                if (npc.id === 'watercooler_emp') {
                    this.addLine("*sips water nervously*");
                    this.addLine("Did you hear? The last batch of candidates never came back from the server room...");
                    this.addLine("I mean, they probably just got hired. Right? ...Right?");
                } else if (npc.id === 'senior') {
                    this.addLine("Oh, another fresh candidate. Listen carefully.");
                    this.addLine("Keep your head down and do as they say. Trust me on this.");
                    this.addLine("The company has... unconventional interview methods.");
                }
                break;
            case 'tech':
                this.addLine("Hey! I'm IT Ravi. The server room's been acting up lately.");
                this.addLine("Strange electromagnetic signals... almost like something alive is in there.");
                this.addLine("If you find my keycard, please bring it back. I dropped it somewhere near reception.");
                break;
            case 'tree':
                this.addLine("You notice something glowing behind the plant...");
                this.addLine("It's a hidden server terminal! The screen flickers with encrypted data.");
                this.addChoice("[What do you do?]", ["🔓 HACK THE SERVER"], () => {
                    this.addLine("[SYSTEM]: DECRYPTING... ACCESS GRANTED.");
                    this.addLine("[SYSTEM]: WARNING — CONTAINMENT BREACH DETECTED.");
                    this.addLine("The walls begin to crack... something massive is waking up!");
                    this.addChoice("[Prepare for Impact]", ["⚔️ FIGHT THE GIANT"], () => {
                        this.memory.flags.roundsPassed = 2;
                        this.memory.save();
                        npc.active = false;
                        window.game.startBattleAction('giant2');
                    });
                    this.processNextLine();
                });
                break;
            case 'senior_dev':
                if (this.memory.flags.roundsPassed === 0 && !name) {
                    // First meeting at entrance
                    this.addLine("Hey! You made it! I'm Uncle Arjun — Senior Developer here at COMPANY.");
                    this.addLine("Your Mom told me you'd be coming for the interview today.");
                    this.addLine("Listen, I can't pull strings for you, but I CAN give you some advice.");
                    this.addLine("First things first — go talk to Sarah at the Reception desk. She'll register you.");
                    this.addLine("After that, head through the double doors and find Room A for Round 1: Group Discussion.");
                    this.addLine("Answer wisely in there. The Moderator, Mr. Grey, doesn't tolerate fools.");
                    this.addLine("I'll be around if you need me. Good luck, kid! 💪");
                } else if (this.memory.flags.roundsPassed === 0 && name) {
                    this.addLine(`${name}! Have you talked to the Moderator in Room A yet?`);
                    this.addLine("Room A is through the double doors and to the LEFT.");
                    this.addLine("Remember: be confident, choose wisely, and don't stay silent!");
                } else if (this.memory.flags.roundsPassed === 1 && !this.memory.flags.hasKeycard) {
                    // After Round 1
                    this.addLine("You survived Round 1?! I knew you had it in the family!");
                    this.addLine("But listen... something strange is happening in the Server Room.");
                    this.addLine("You'll need a KEYCARD to access it. I heard someone dropped one near the Reception lobby.");
                    this.addLine("Also, check the table in the GD Room — I saw a note there that might help.");
                    this.addLine("Find the keycard, then head to the glass doors in the middle of the corridor.");
                } else if (this.memory.flags.roundsPassed === 1 && this.memory.flags.hasKeycard) {
                    // Has keycard, need to find tree
                    this.addLine("You found the keycard! Smart move.");
                    this.addLine("Now, here's a secret only us Senior Devs know...");
                    this.addLine("The main terminal at the glass door is a decoy. The REAL access point...");
                    this.addLine("...is hidden behind a PLANT in the corridor. Look for a glowing tree nearby.");
                    this.addLine("Interact with it and you'll find the hidden server terminal. Be careful though!");
                } else if (this.memory.flags.roundsPassed >= 2 && this.memory.flags.bossesDefeated < 2) {
                    // After Round 2
                    this.addLine("Two rounds cleared! You're doing incredible!");
                    this.addLine("But I need to warn you about something...");
                    this.addLine("The HR Manager's office is on the RIGHT side of the corridor.");
                    this.addLine("Something isn't right about that office. I've heard... noises.");
                    this.addLine("Go there when you're ready. But be prepared for ANYTHING.");
                } else if (this.memory.flags.bossesDefeated >= 2) {
                    this.addLine("You... you actually defeated the Overlord?!");
                    this.addLine("I always knew there was something wrong with this company.");
                    this.addLine("You saved us all, kid. I'm proud to call you family. 🎉");
                }
                break;
        }
    }

    startGroupDiscussion() {
        this.addLine("[GD Moderator]: The topic is: 'If humanity encountered advanced alien life, should we fight or cooperate?'");
        this.addLine("[Candidate A]: We must fight! They would only want to harvest our planet's resources.");
        this.addChoice("Your Response:", [
            "Cooperate. Shared knowledge is power.",
            "Fight them all. Trust no one.",
            "[Remain Silent]"
        ], (c) => {
            if (c === 0) {
                this.memory.addGDScore(5);
                this.addLine("[GD Moderator]: An optimistic, collaborative approach. Excellent.");
            } else if (c === 1) {
                this.memory.addGDScore(-2);
                this.addLine("[GD Moderator]: Aggressive, but perhaps necessary for survival.");
            } else {
                this.memory.addGDScore(-5);
                this.addLine("[GD Moderator]: Silence shows a lack of confidence.");
            }

            this.addLine("[Candidate B]: But what if their technology is indistinguishable from magic? We'd be bugs to them.");
            this.addChoice("Your Response:", [
                "We study their magic until it becomes our science.",
                "Then we squish them first.",
                "[Agree with Candidate B]"
            ], (c2) => {
                if (c2 === 0) {
                    this.memory.addGDScore(5);
                    this.addLine("[GD Moderator]: Adaptability is a core COMPANY value.");
                } else if (c2 === 1) {
                    this.memory.addGDScore(-5);
                    this.addLine("[GD Moderator]: Brute force is rarely the answer to superior intellect.");
                } else {
                    this.memory.addGDScore(0);
                    this.addLine("[GD Moderator]: Echoing others does not show leadership.");
                }

                // Evaluate
                this.addChoice("Conclude GD?", ["View Results"], () => {
                    const score = this.memory.getGDScore();
                    if (score > 4) {
                        this.addLine(`[GD Moderator]: Candidate ${this.memory.getPlayerName()}... you have passed Round 1.`);
                        this.addLine("[GD Moderator]: However, the true test of your resilience begins now.");
                        this.addLine("The walls begin to shift and grind...");
                        this.addChoice("[Prepare for Combat]", ["Draw Weapon"], () => {
                            window.game.player.gridX = 13;
                            window.game.player.gridY = 16;
                            window.game.player.pixelX = 13 * TILE_SIZE;
                            window.game.player.pixelY = 16 * TILE_SIZE;
                            this.memory.flags.roundsPassed = 1;
                            this.memory.save();
                            window.game.startBattleAction('giant1');
                        });
                    } else {
                        this.addLine(`[GD Moderator]: Candidate ${this.memory.getPlayerName()}... you have failed.`);
                        this.addLine("[GD Moderator]: Security will escort you out.");
                        this.addChoice("[Security arrives]", ["Leave in shame"], () => {
                            this.memory.failRound();
                            window.game.restartToRound1();
                        });
                    }
                    this.processNextLine();
                });
                this.processNextLine();
            });
            this.processNextLine();
        });
    }

    startHRTwist(name) {
        this.addLine(`Impressive, ${name}. You defeated the guardians. But do you know what this company really is?`);
        this.addLine("We aren't hiring employees. We are harvesting strong vessels.");
        this.addLine("The giants you fought? My alien brethren. The interview? A test of your physical and mental limits.");
        this.addLine("And the real human HR Manager... well, she is currently our battery.");
        this.addLine("Now, submit your vessel to the Overlord!");
        this.addChoice("[Defend Yourself]", ["Engage Overlord"], () => {
            window.game.startBattleAction('alien_hr');
        });
    }

    addLine(t) { this.lines.push({ type: 'text', text: t }); }
    addTextInput(p, cb) { this.lines.push({ type: 'input', text: p, callback: cb }); }
    addChoice(p, o, cb) { this.lines.push({ type: 'choice', text: p, options: o, callback: cb }); }

    processNextLine() {
        if (this.currentLine >= this.lines.length) { this.end(); return; }
        const line = this.lines[this.currentLine];
        this.fullText = line.text; this.displayedText = ''; this.charIndex = 0;
        this.waitingForInput = false; this.waitingForText = false; this.choices = null;
    }

    update(dt) {
        if (!this.active || this.currentLine >= this.lines.length) return;
        const line = this.lines[this.currentLine];
        if (this.charIndex < this.fullText.length) {
            this.typeTimer += dt;
            if (this.typeTimer >= this.typeSpeed) {
                this.typeTimer = 0;
                this.charIndex++;
                this.displayedText = this.fullText.substring(0, this.charIndex);
            }
        } else {
            if (line.type === 'text') this.waitingForInput = true;
            else if (line.type === 'input' && !this.waitingForText) { this.waitingForText = true; this.showInput(); }
            else if (line.type === 'choice' && !this.choices) { this.choices = line.options; this.selectedChoice = 0; }
        }
        this.portraitAnim += dt;
    }

    showInput() {
        if (this.inputEl) {
            this.inputEl.style.display = 'block';
            this.inputEl.value = '';
            setTimeout(() => { this.inputEl.focus(); }, 50);
        }
    }

    hideInput() { if (this.inputEl) this.inputEl.style.display = 'none'; }

    handleKey(key) {
        if (!this.active) return false;
        if (this.waitingForText) return true;

        if (this.charIndex < this.fullText.length) {
            this.charIndex = this.fullText.length;
            this.displayedText = this.fullText;
            return true;
        }

        if (this.waitingForInput && (key === 'KeyE' || key === 'Enter' || key === 'Space' || key === 'Click')) {
            this.waitingForInput = false;
            this.currentLine++;
            this.processNextLine();
            return true;
        }

        if (this.choices) {
            if (key === 'ArrowUp' || key === 'KeyW') { this.selectedChoice = Math.max(0, this.selectedChoice - 1); return true; }
            if (key === 'ArrowDown' || key === 'KeyS') { this.selectedChoice = Math.min(this.choices.length - 1, this.selectedChoice + 1); return true; }
            if (key === 'KeyE' || key === 'Enter' || key === 'Space' || key === 'Click') {
                const cb = this.lines[this.currentLine].callback;
                const c = this.selectedChoice;
                this.choices = null;
                this.currentLine++;
                if (cb) cb(c); else this.processNextLine();
                return true;
            }
        }
        return false;
    }

    submitTextInput(text) {
        if (!this.waitingForText) return;
        this.waitingForText = false; this.hideInput();
        const line = this.lines[this.currentLine]; this.currentLine++;
        if (line.callback) line.callback(text); else this.processNextLine();
    }

    end() {
        this.active = false;
        this.currentNPC = null;
        this.lines = [];
        this.currentLine = 0;
        this.hideInput();
    }

    draw(ctx) {
        if (!this.active || this.currentLine >= this.lines.length) return;
        const bH = 120, bY = CANVAS_HEIGHT - bH - 10, bX = 10, bW = CANVAS_WIDTH - 20;
        ctx.fillStyle = COLORS.UI_BG; ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 3; ctx.strokeRect(bX, bY, bW, bH);
        ctx.strokeStyle = 'rgba(64, 160, 255, 0.3)'; ctx.lineWidth = 1; ctx.strokeRect(bX + 4, bY + 4, bW - 8, bH - 8);

        // Portrait
        if (this.currentNPC) {
            const pX = bX + 12, pY = bY + 12, pS = 64;
            ctx.fillStyle = 'rgba(40,40,60,0.8)'; ctx.fillRect(pX - 2, pY - 2, pS + 4, pS + 4);
            ctx.strokeStyle = COLORS.UI_BORDER; ctx.lineWidth = 2; ctx.strokeRect(pX - 2, pY - 2, pS + 4, pS + 4);
            ctx.save(); ctx.translate(pX, pY); ctx.scale(2, 2);
            this.currentNPC.draw(ctx, this.currentNPC.pixelX - 4, this.currentNPC.pixelY - 8); // cheat draw
            ctx.restore();
            ctx.fillStyle = COLORS.UI_BORDER; ctx.font = '9px "Share Tech Mono",monospace';
            ctx.fillText(this.currentNPC.name, pX, bY + bH - 14);
        } else {
            // No portrait (System/Narrator)
            ctx.fillStyle = COLORS.UI_BORDER; ctx.font = '9px "Share Tech Mono",monospace';
            ctx.fillText("SYSTEM", bX + 12, bY + bH - 14);
        }

        // Text
        ctx.fillStyle = COLORS.UI_TEXT; ctx.font = '12px "Share Tech Mono",monospace';
        this.wrapText(ctx, this.displayedText, bX + 90, bY + 24, bW - 110, 18);

        if (this.waitingForInput) {
            if (Math.sin(Date.now() / 300) > 0) { ctx.fillStyle = COLORS.UI_BORDER; ctx.fillRect(bX + bW - 24, bY + bH - 20, 8, 8); }
            ctx.fillStyle = 'rgba(64, 160, 255, 0.6)'; ctx.font = '10px "Share Tech Mono",monospace'; ctx.fillText('[E] / [CLICK]', bX + bW - 120, bY + bH - 8);
        }
        if (this.waitingForText) { ctx.fillStyle = COLORS.NEON_GREEN; ctx.font = '10px "Share Tech Mono",monospace'; ctx.fillText('Type response + Enter', bX + 90, bY + bH - 12); }
        if (this.choices) {
            let cY = bY + 44; ctx.font = '11px "Share Tech Mono",monospace';
            this.choices.forEach((ch, i) => {
                ctx.fillStyle = i === this.selectedChoice ? COLORS.NEON_GREEN : '#80A0C0';
                ctx.fillText((i === this.selectedChoice ? '> ' : '  ') + ch, bX + 90, cY);
                cY += 18;
            });
        }
    }

    wrapText(ctx, text, x, y, mw, lh) {
        const w = text.split(' '); let l = '', ly = y;
        for (let i = 0; i < w.length; i++) { const t = l + w[i] + ' '; if (ctx.measureText(t).width > mw && i > 0) { ctx.fillText(l.trim(), x, ly); l = w[i] + ' '; ly += lh; } else l = t; }
        ctx.fillText(l.trim(), x, ly);
    }
}
