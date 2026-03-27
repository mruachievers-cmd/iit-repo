// ============================================
// MAP GENERATION & DRAWING (Enhanced Pixel Art)
// ============================================
class TileMap {
    constructor() {
        this.maps = {};
        this.currentMap = 'home';
        this.buildHomeMap();
        this.buildCompanyMap();
        this.buildArenaMap();
    }

    buildHomeMap() {
        const rows = 15;
        const cols = 20;
        const grid = Array(rows).fill(0).map(() => Array(cols).fill(T.FLOOR));

        // Walls
        for (let i = 0; i < cols; i++) { grid[0][i] = T.WALL; grid[rows - 1][i] = T.WALL; }
        for (let i = 0; i < rows; i++) { grid[i][0] = T.WALL; grid[i][cols - 1] = T.WALL; }

        // Door to exit
        grid[rows - 1][10] = T.DOOR;
        grid[rows - 1][9] = T.DOOR;

        // Bed (left side)
        grid[6][2] = T.BED; grid[7][2] = T.BED;

        // Center Rug
        for (let r = 5; r <= 10; r++) {
            for (let c = 6; c <= 12; c++) { grid[r][c] = T.RUG; }
        }

        // TV / Console
        grid[5][9] = T.TV;

        // PC / Desk
        grid[1][2] = T.PC;
        grid[1][3] = T.DESK;
        grid[2][3] = T.CHAIR;

        // Stairs
        grid[1][16] = T.STAIRS; grid[2][16] = T.STAIRS; grid[3][16] = T.STAIRS;

        // NEW: Enhanced home environment
        grid[1][7] = T.BOOKSHELF; grid[1][8] = T.BOOKSHELF;
        grid[1][12] = T.WINDOW_TILE; grid[1][13] = T.WINDOW_TILE;
        grid[6][17] = T.WARDROBE; grid[7][17] = T.WARDROBE;
        grid[3][2] = T.LAMP;
        grid[10][17] = T.PLANT;
        grid[1][15] = T.POSTER;
        grid[11][2] = T.KITCHEN; grid[11][3] = T.KITCHEN;
        grid[12][3] = T.CHAIR;
        // Carpet around rug
        grid[4][7] = T.CARPET; grid[4][8] = T.CARPET; grid[4][9] = T.CARPET; grid[4][10] = T.CARPET; grid[4][11] = T.CARPET;

        this.maps['home'] = { grid, cols, rows };
    }

    buildCompanyMap() {
        const rows = 40;
        const cols = 50;
        const grid = Array(rows).fill(0).map(() => Array(cols).fill(T.FLOOR_DARK));

        // Bottom - Street
        for (let i = rows - 6; i < rows; i++) {
            for (let j = 0; j < cols; j++) { grid[i][j] = T.STREET; }
        }
        for (let j = 0; j < cols; j++) { grid[rows - 7][j] = T.SIDEWALK; }

        // Company Exterior Walls
        for (let i = 0; i < rows - 7; i++) {
            grid[i][5] = T.WALL;
            grid[i][44] = T.WALL;
        }
        for (let j = 0; j < cols; j++) {
            if (j < 5 || j > 44) {
                for (let i = 0; i < rows - 7; i++) grid[i][j] = T.VOID;
            }
        }
        for (let j = 5; j <= 44; j++) { grid[rows - 8][j] = T.WALL; }

        // Front Doors
        grid[rows - 8][24] = T.DOOR; grid[rows - 8][25] = T.DOOR;

        // Lobby (Inside)
        for (let i = rows - 20; i < rows - 8; i++) {
            for (let j = 6; j <= 43; j++) { grid[i][j] = T.FLOOR; }
        }

        // Reception Desk
        for (let j = 22; j <= 27; j++) { grid[rows - 14][j] = T.RECEPTION; }

        // Lobby decorations
        grid[rows - 12][8] = T.PLANT; grid[rows - 12][41] = T.PLANT;
        grid[rows - 10][8] = T.WATER_COOLER;
        grid[rows - 18][8] = T.ELEVATOR; grid[rows - 17][8] = T.ELEVATOR;
        grid[rows - 18][41] = T.ELEVATOR; grid[rows - 17][41] = T.ELEVATOR;
        // Lobby chairs for waiting candidates
        grid[rows - 10][12] = T.CHAIR; grid[rows - 10][14] = T.CHAIR;
        grid[rows - 10][16] = T.CHAIR;
        // Lobby windows
        grid[rows - 18][10] = T.WINDOW_TILE; grid[rows - 18][12] = T.WINDOW_TILE;
        grid[rows - 18][38] = T.WINDOW_TILE; grid[rows - 18][40] = T.WINDOW_TILE;
        // Posters
        grid[rows - 19][15] = T.POSTER; grid[rows - 19][35] = T.POSTER;

        // Corridor up to interview rooms
        for (let i = rows - 30; i < rows - 20; i++) {
            for (let j = 6; j <= 43; j++) { grid[i][j] = T.FLOOR; }
        }
        // Room Partitions
        for (let j = 6; j <= 43; j++) { grid[rows - 20][j] = T.GLASS_WALL; grid[rows - 30][j] = T.GLASS_WALL; }
        grid[rows - 20][24] = T.DOOR; grid[rows - 20][25] = T.DOOR;

        // Group Discussion Room (Room A, Left) - with cubicle walls
        grid[rows - 26][12] = T.TABLE; grid[rows - 26][13] = T.TABLE; grid[rows - 26][14] = T.TABLE;
        grid[rows - 25][12] = T.TABLE; grid[rows - 25][13] = T.TABLE; grid[rows - 25][14] = T.TABLE;
        grid[rows - 27][13] = T.CHAIR; // Moderator
        grid[rows - 25][11] = T.CHAIR; // Candidate 1
        grid[rows - 25][15] = T.CHAIR; // Candidate 2
        grid[rows - 24][13] = T.CHAIR; // Player
        // Cubicle walls around GD room
        for (let i = rows - 28; i <= rows - 23; i++) { grid[i][9] = T.CUBICLE_WALL; }
        for (let j = 9; j <= 17; j++) { grid[rows - 28][j] = T.CUBICLE_WALL; }
        for (let i = rows - 28; i <= rows - 23; i++) { grid[i][17] = T.CUBICLE_WALL; }
        grid[rows - 23][13] = T.FLOOR; // Entry

        // Laptops on desks in GD room
        grid[rows - 26][11] = T.LAPTOP;
        grid[rows - 26][15] = T.LAPTOP;

        // HR Room (Room B, Right) - with cubicle walls
        grid[rows - 28][35] = T.DESK; grid[rows - 28][36] = T.DESK; grid[rows - 28][37] = T.DESK;
        grid[rows - 27][36] = T.LAPTOP;
        grid[rows - 26][36] = T.CHAIR;
        // Cubicle walls around HR room
        for (let i = rows - 29; i <= rows - 24; i++) { grid[i][33] = T.CUBICLE_WALL; }
        for (let j = 33; j <= 39; j++) { grid[rows - 29][j] = T.CUBICLE_WALL; }
        for (let i = rows - 29; i <= rows - 24; i++) { grid[i][39] = T.CUBICLE_WALL; }
        grid[rows - 24][36] = T.FLOOR; // Entry

        // Plants in corridor
        grid[rows - 22][10] = T.PLANT; grid[rows - 22][40] = T.PLANT;
        grid[rows - 28][20] = T.PLANT;

        this.maps['company'] = { grid, cols, rows };
    }

    buildArenaMap() {
        const rows = 30;
        const cols = 40;
        const grid = Array(rows).fill(0).map(() => Array(cols).fill(T.CORRUPT_FLOOR));

        // Arena Boundaries
        for (let i = 0; i < cols; i++) { grid[0][i] = T.CORRUPT_WALL; grid[rows - 1][i] = T.CORRUPT_WALL; }
        for (let i = 0; i < rows; i++) { grid[i][0] = T.CORRUPT_WALL; grid[i][cols - 1] = T.CORRUPT_WALL; }

        // Red scattered marks
        for (let i = 0; i < 30; i++) {
            grid[Math.floor(Math.random() * (rows - 2)) + 1][Math.floor(Math.random() * (cols - 2)) + 1] = T.BLOOD_FLOOR;
        }

        this.maps['arena'] = { grid, cols, rows };
    }

    getCurrentMapSize() {
        if (!this.maps[this.currentMap]) return { cols: 10, rows: 10 };
        const map = this.maps[this.currentMap];
        return { cols: map.cols, rows: map.rows };
    }

    getTile(row, col) {
        const map = this.maps[this.currentMap];
        if (!map || row < 0 || row >= map.rows || col < 0 || col >= map.cols) return T.VOID;
        return map.grid[row][col];
    }

    setTile(row, col, type) {
        const map = this.maps[this.currentMap];
        if (map && row >= 0 && row < map.rows && col >= 0 && col < map.cols) {
            map.grid[row][col] = type;
        }
    }

    isSolid(row, col) {
        const tile = this.getTile(row, col);
        return SOLID_TILES.includes(tile);
    }

    isDoor(row, col) {
        return this.getTile(row, col) === T.DOOR;
    }

    switchMap(mapName) {
        if (this.maps[mapName]) { this.currentMap = mapName; return true; }
        return false;
    }

    drawTile(ctx, tile, x, y) {
        const S = TILE_SIZE;
        switch (tile) {
            case T.FLOOR:
                ctx.fillStyle = "#E8E8C8";
                ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = "#D0D0A8"; ctx.lineWidth = 0.5;
                ctx.strokeRect(x + 1, y + 1, S - 2, S - 2);
                break;
            case T.FLOOR_DARK:
                ctx.fillStyle = COLORS.FLOOR_DARK;
                ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = '#C0C4CF'; ctx.lineWidth = 0.3;
                ctx.strokeRect(x, y, S, S);
                break;
            case T.WALL:
                // Brick-style wall with shading
                ctx.fillStyle = "#B89060";
                ctx.fillRect(x, y, S, S);
                ctx.fillStyle = "#A07850";
                ctx.fillRect(x, y + S - 6, S, 6);
                ctx.fillStyle = "#C8A070";
                ctx.fillRect(x + 2, y + 2, S - 4, 3);
                // Brick lines
                ctx.strokeStyle = '#907040'; ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x + S, y + 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + S/2, y); ctx.lineTo(x + S/2, y + 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x + S, y + 20); ctx.stroke();
                break;
            case T.DOOR:
                ctx.fillStyle = "#A06030";
                ctx.fillRect(x + 4, y, S - 8, S);
                ctx.fillStyle = "#FFD060";
                ctx.beginPath(); ctx.arc(x + S - 8, y + S/2, 2, 0, Math.PI*2); ctx.fill();
                // Door frame
                ctx.strokeStyle = '#806020'; ctx.lineWidth = 1;
                ctx.strokeRect(x + 4, y, S - 8, S);
                break;
            case T.BED:
                ctx.fillStyle = "#E8E8C8"; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = "#FF8080";
                ctx.fillRect(x + 2, y + 2, S - 4, S - 4);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(x + 4, y + 2, S - 8, 10);
                ctx.fillStyle = "#C04040";
                ctx.fillRect(x + 2, y + S - 6, S - 4, 4);
                // Rounded pillow
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath(); ctx.arc(x + S/2, y + 8, 6, 0, Math.PI*2); ctx.fill();
                break;
            case T.RUG:
                ctx.fillStyle = "#E06060";
                ctx.fillRect(x, y, S, S);
                // Pattern
                ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 0.5;
                ctx.strokeRect(x + 4, y + 4, S - 8, S - 8);
                ctx.strokeStyle = "#FFD0D0";
                ctx.beginPath(); ctx.arc(x + S/2, y + S/2, 6, 0, Math.PI*2); ctx.stroke();
                break;
            case T.TV:
                ctx.fillStyle = "#E8E8C8"; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = "#404040";
                ctx.fillRect(x + 3, y + 2, S - 6, 18);
                ctx.fillStyle = "#202020";
                ctx.fillRect(x + 5, y + 4, S - 10, 12);
                // Screen glow
                ctx.fillStyle = `rgba(64,160,255,${0.3 + Math.sin(Date.now()/500)*0.2})`;
                ctx.fillRect(x + 5, y + 4, S - 10, 12);
                ctx.fillStyle = "#606060";
                ctx.fillRect(x + S/2 - 2, y + 20, 4, 6);
                ctx.fillRect(x + S/2 - 6, y + 26, 12, 2);
                break;
            case T.PC:
                ctx.fillStyle = "#E8E8C8"; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = "#A0A0A0";
                ctx.fillRect(x + 4, y + 2, S - 8, 16);
                ctx.fillStyle = "#4080C0";
                ctx.fillRect(x + 6, y + 4, S - 12, 10);
                // Keyboard
                ctx.fillStyle = "#808080";
                ctx.fillRect(x + 6, y + 22, S - 12, 6);
                break;
            case T.STAIRS:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = '#D0A060';
                    ctx.fillRect(x, y + (i*8), S, 6);
                    ctx.fillStyle = '#A07040';
                    ctx.fillRect(x, y + (i*8) + 6, S, 2);
                }
                break;
            case T.DESK:
            case T.TABLE:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = "#A07040";
                ctx.fillRect(x + 2, y + 4, S - 4, S - 8);
                // Wood grain
                ctx.strokeStyle = '#906030'; ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(x+4, y+8); ctx.lineTo(x+S-4, y+8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x+4, y+16); ctx.lineTo(x+S-4, y+16); ctx.stroke();
                break;
            case T.PLANT:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = '#A06040'; // pot
                ctx.fillRect(x + 10, y + 18, 12, 12);
                ctx.fillStyle = '#40A040'; // leaves
                ctx.beginPath(); ctx.arc(x + 16, y + 14, 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#30A030';
                ctx.beginPath(); ctx.arc(x + 12, y + 10, 6, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 20, y + 10, 6, 0, Math.PI * 2); ctx.fill();
                break;
            case T.STREET:
                ctx.fillStyle = COLORS.STREET; ctx.fillRect(x, y, S, S);
                // Road markings
                if (Math.floor(x / S) % 4 === 0) {
                    ctx.fillStyle = '#606060';
                    ctx.fillRect(x + 12, y + 14, 8, 4);
                }
                break;
            case T.SIDEWALK:
                ctx.fillStyle = COLORS.SIDEWALK; ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = '#808080'; ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, S, S);
                break;
            case T.GLASS_WALL:
                ctx.fillStyle = COLORS.GLASS; ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(x + 4, y + S - 4); ctx.lineTo(x + S - 4, y + 4); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x + 8, y + S - 2); ctx.lineTo(x + S - 2, y + 8); ctx.stroke();
                break;
            case T.RECEPTION:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = '#204060';
                ctx.fillRect(x, y + 6, S, 20);
                // Monitor on reception
                ctx.fillStyle = '#303030';
                ctx.fillRect(x + 10, y + 2, 12, 8);
                ctx.fillStyle = '#40A0FF';
                ctx.fillRect(x + 11, y + 3, 10, 6);
                break;
            case T.CHAIR:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                // Rounded chair
                ctx.fillStyle = '#404040';
                ctx.beginPath(); ctx.arc(x + S/2, y + S/2 + 2, 8, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#505050';
                ctx.fillRect(x + S/2 - 3, y + S/2 + 6, 6, 6);
                // Backrest
                ctx.fillStyle = '#353535';
                ctx.fillRect(x + S/2 - 6, y + 4, 12, 10);
                break;
            case T.PUZZLE_TERMINAL:
                ctx.fillStyle = '#202020'; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = COLORS.NEON_BLUE;
                ctx.fillRect(x + 4, y + 4, S - 8, S - 8);
                // Scanlines
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                for (let i = 0; i < S; i += 4) ctx.fillRect(x + 4, y + 4 + i, S - 8, 1);
                break;
            case T.CORRUPT_FLOOR:
                ctx.fillStyle = COLORS.CORRUPT_FLOOR; ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = 'rgba(255, 16, 80, 0.1)';
                ctx.strokeRect(x, y, S, S);
                break;
            case T.CORRUPT_WALL:
                ctx.fillStyle = COLORS.CORRUPT_WALL; ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = COLORS.NEON_RED; ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y + 2, S - 4, S - 4);
                // Pulsing glow
                ctx.fillStyle = `rgba(255,16,80,${0.05 + Math.sin(Date.now()/800)*0.05})`;
                ctx.fillRect(x, y, S, S);
                break;
            case T.BLOOD_FLOOR:
                ctx.fillStyle = COLORS.CORRUPT_FLOOR; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = COLORS.NEON_RED;
                ctx.globalAlpha = 0.5;
                ctx.beginPath(); ctx.arc(x + 16, y + 16, 8 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
                break;
            case T.VOID:
                ctx.fillStyle = COLORS.VOID; ctx.fillRect(x, y, S, S);
                break;

            // ===== NEW TILES =====
            case T.BOOKSHELF:
                ctx.fillStyle = '#8B6A45'; ctx.fillRect(x, y, S, S);
                // Books
                const bookColors = ['#E04040','#4040E0','#40C040','#E0E040','#E080E0'];
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = bookColors[i];
                    ctx.fillRect(x + 3 + i * 5, y + 4, 4, 12);
                }
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = bookColors[(i+2)%5];
                    ctx.fillRect(x + 4 + i * 6, y + 18, 5, 10);
                }
                break;
            case T.WINDOW_TILE:
                ctx.fillStyle = '#B89060'; ctx.fillRect(x, y, S, S);
                // Sky view
                ctx.fillStyle = '#80C0FF';
                ctx.fillRect(x + 3, y + 3, S - 6, S - 6);
                // Clouds
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath(); ctx.arc(x + 10, y + 12, 4, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 16, y + 10, 5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 22, y + 12, 4, 0, Math.PI*2); ctx.fill();
                // Frame
                ctx.strokeStyle = '#806040'; ctx.lineWidth = 2;
                ctx.strokeRect(x + 3, y + 3, S - 6, S - 6);
                ctx.beginPath(); ctx.moveTo(x + S/2, y + 3); ctx.lineTo(x + S/2, y + S - 3); ctx.stroke();
                break;
            case T.WARDROBE:
                ctx.fillStyle = '#906040'; ctx.fillRect(x + 2, y, S - 4, S);
                ctx.strokeStyle = '#704020'; ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y, S - 4, S);
                ctx.beginPath(); ctx.moveTo(x + S/2, y); ctx.lineTo(x + S/2, y + S); ctx.stroke();
                // Handles
                ctx.fillStyle = '#FFD060';
                ctx.beginPath(); ctx.arc(x + S/2 - 4, y + S/2, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + S/2 + 4, y + S/2, 2, 0, Math.PI*2); ctx.fill();
                break;
            case T.LAMP:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                // Lamp post
                ctx.fillStyle = '#808080';
                ctx.fillRect(x + S/2 - 2, y + 10, 4, 18);
                // Shade
                ctx.fillStyle = '#FFE080';
                ctx.beginPath(); ctx.moveTo(x + 6, y + 10); ctx.lineTo(x + S - 6, y + 10); ctx.lineTo(x + S/2, y + 2); ctx.fill();
                // Glow
                ctx.fillStyle = `rgba(255,224,128,${0.15 + Math.sin(Date.now()/600)*0.1})`;
                ctx.beginPath(); ctx.arc(x + S/2, y + 10, 14, 0, Math.PI*2); ctx.fill();
                break;
            case T.LAPTOP:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                // Screen
                ctx.fillStyle = '#303030';
                ctx.fillRect(x + 6, y + 4, S - 12, 14);
                ctx.fillStyle = '#40A0FF';
                ctx.fillRect(x + 7, y + 5, S - 14, 12);
                // Keyboard
                ctx.fillStyle = '#404040';
                ctx.fillRect(x + 4, y + 20, S - 8, 8);
                // Keys
                ctx.fillStyle = '#606060';
                for(let r = 0; r < 2; r++) for(let c = 0; c < 5; c++) {
                    ctx.fillRect(x + 6 + c*4, y + 22 + r*3, 3, 2);
                }
                break;
            case T.WATER_COOLER:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                // Base
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 8, y + 16, 16, 14);
                // Jug
                ctx.fillStyle = '#A0D0FF';
                ctx.beginPath(); ctx.arc(x + S/2, y + 12, 8, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#80B0E0';
                ctx.beginPath(); ctx.arc(x + S/2, y + 12, 5, 0, Math.PI*2); ctx.fill();
                break;
            case T.ELEVATOR:
                ctx.fillStyle = '#808090'; ctx.fillRect(x, y, S, S);
                ctx.strokeStyle = '#606070'; ctx.lineWidth = 1;
                ctx.strokeRect(x + 2, y + 2, S - 4, S - 4);
                ctx.beginPath(); ctx.moveTo(x + S/2, y + 2); ctx.lineTo(x + S/2, y + S - 2); ctx.stroke();
                // Arrow
                ctx.fillStyle = '#FFD060';
                ctx.beginPath(); ctx.moveTo(x + S/2, y + 6); ctx.lineTo(x + S/2 - 4, y + 12); ctx.lineTo(x + S/2 + 4, y + 12); ctx.fill();
                break;
            case T.CARPET:
                ctx.fillStyle = '#C86040';
                ctx.fillRect(x, y, S, S);
                ctx.fillStyle = '#B05030';
                ctx.fillRect(x + 2, y + 2, S - 4, S - 4);
                break;
            case T.CUBICLE_WALL:
                ctx.fillStyle = '#8090A0';
                ctx.fillRect(x, y, S, S);
                ctx.fillStyle = '#708090';
                ctx.fillRect(x + 2, y + 2, S - 4, S - 4);
                // Fabric texture
                ctx.strokeStyle = '#607080'; ctx.lineWidth = 0.5;
                for (let i = 4; i < S; i += 6) {
                    ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x + S, y + i); ctx.stroke();
                }
                break;
            case T.KITCHEN:
                ctx.fillStyle = COLORS.FLOOR; ctx.fillRect(x, y, S, S);
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x, y + 4, S, S - 8);
                // Stove burners
                ctx.fillStyle = '#404040';
                ctx.beginPath(); ctx.arc(x + 10, y + 14, 4, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(x + 22, y + 14, 4, 0, Math.PI*2); ctx.fill();
                break;
            case T.POSTER:
                ctx.fillStyle = '#B89060'; ctx.fillRect(x, y, S, S);
                // Poster frame
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 6, y + 4, S - 12, S - 8);
                ctx.fillStyle = '#4080C0';
                ctx.fillRect(x + 8, y + 6, S - 16, S - 12);
                // Star
                ctx.fillStyle = '#FFD060';
                ctx.beginPath(); ctx.arc(x + S/2, y + S/2, 4, 0, Math.PI*2); ctx.fill();
                break;
            default:
                ctx.fillStyle = COLORS.VOID; ctx.fillRect(x, y, S, S);
                break;
        }
    }
}
