// ============================================
// CAMERA SYSTEM
// ============================================
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.1;
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }

    follow(targetX, targetY) {
        // Center camera on target
        this.targetX = targetX - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
        this.targetY = targetY - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;

        // Clamp to map bounds
        const maxX = MAP_COLS * TILE_SIZE - CANVAS_WIDTH;
        const maxY = MAP_ROWS * TILE_SIZE - CANVAS_HEIGHT;
        this.targetX = Math.max(0, Math.min(this.targetX, maxX));
        this.targetY = Math.max(0, Math.min(this.targetY, maxY));

        // Smooth follow
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(dt) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= dt;
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    }

    getOffset() {
        return {
            x: Math.round(this.x + this.shakeX),
            y: Math.round(this.y + this.shakeY)
        };
    }
}
