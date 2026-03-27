// ============================================
// CONSTANTS & CONFIGURATION
// ============================================
const TILE_SIZE = 32;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const MAP_COLS = 50;
const MAP_ROWS = 40;
const MOVE_SPEED = 3;

// Game States
const STATE = {
    MENU: 'menu',
    EXPLORE: 'explore',
    DIALOGUE: 'dialogue',
    GD_SCENE: 'gd_scene',
    BATTLE_ACTION: 'battle_action',
    PUZZLE: 'puzzle',
    GAMEOVER: 'gameover',
    ENDING: 'ending',
    PAUSED: 'paused'
};

// Tile Types
const T = {
    FLOOR: 0,
    WALL: 1,
    DOOR: 2,
    BED: 3,
    DESK: 4,
    PLANT: 5,
    STREET: 6,
    SIDEWALK: 7,
    GLASS_WALL: 8,
    RECEPTION: 9,
    TABLE: 10,
    CHAIR: 11,
    PUZZLE_TERMINAL: 12,
    VOID: 13,
    BLOOD_FLOOR: 14,
    CORRUPT_WALL: 15,
    RUG: 16,
    TV: 17,
    STAIRS: 18,
    PC: 19,
    CORRUPT_FLOOR: 20,
    // New tile types
    BOOKSHELF: 21,
    WINDOW_TILE: 22,
    WARDROBE: 23,
    LAMP: 24,
    LAPTOP: 25,
    WATER_COOLER: 26,
    ELEVATOR: 27,
    CARPET: 28,
    CUBICLE_WALL: 29,
    KITCHEN: 30,
    POSTER: 31
};

// Which tiles block movement
const SOLID_TILES = [T.WALL, T.BED, T.DESK, T.PLANT, T.GLASS_WALL, T.RECEPTION, T.TABLE,
    T.PUZZLE_TERMINAL, T.VOID, T.CORRUPT_WALL, T.TV, T.PC, T.BOOKSHELF,
    T.WARDROBE, T.WATER_COOLER, T.ELEVATOR, T.CUBICLE_WALL, T.KITCHEN];

// Modern Corporate / Cybernetic Color Palette
const COLORS = {
    // Normal World (Corporate)
    FLOOR: '#E8EAEF',
    FLOOR_DARK: '#D0D4DF',
    WALL: '#FFFFFF',
    WALL_DARK: '#B0B5C0',
    GLASS: '#A8C8E0',
    WOOD: '#8B6A45',
    STREET: '#404040',
    SIDEWALK: '#909090',

    // Alien World (Corrupted)
    VOID: '#050010',
    CORRUPT_FLOOR: '#1A001A',
    CORRUPT_WALL: '#300030',
    NEON_RED: '#FF1050',
    NEON_BLUE: '#10A0FF',
    NEON_GREEN: '#10FF50',

    // UI
    UI_BG: 'rgba(10, 15, 25, 0.9)',
    UI_BORDER: '#40A0FF',
    UI_TEXT: '#F8F8F8',
    UI_HOVER: '#2050A0',
    HP_GREEN: '#40FF40',
    HP_RED: '#FF4040',
    STAMINA_BLUE: '#40A0FF'
};

// Directions
const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
