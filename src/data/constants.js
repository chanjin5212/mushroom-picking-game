// 게임 초기 상태
export const initialState = {
    user: null, // Add user state
    gold: 0,
    currentWeaponId: 0,
    weaponLevel: 0,
    clickDamage: 1,
    moveSpeed: 5,
    attackRange: 80, // Base attack range
    playerPos: { x: 400, y: 300 },
    currentScene: 'village',
    mushrooms: [],
    diamond: 0, // New currency
    isLoading: false,
    isShopOpen: false,
    isPortalMenuOpen: false,
    lastEnhanceResult: null,
    lastEvolveResult: null,
    // New Stats
    criticalChance: 0, // 0%
    criticalDamage: 150, // x1.5
    hyperCriticalChance: 0, // 0%
    hyperCriticalDamage: 200, // x2.0
    megaCriticalChance: 0, // 0%
    megaCriticalDamage: 250, // x2.5
    // New Tiers
    gigaCriticalChance: 0,
    gigaCriticalDamage: 300, // x3.0
    teraCriticalChance: 0,
    teraCriticalDamage: 350, // x3.5
    petaCriticalChance: 0,
    petaCriticalDamage: 400, // x4.0
    exaCriticalChance: 0,
    exaCriticalDamage: 450, // x4.5
    zettaCriticalChance: 0,
    zettaCriticalDamage: 500, // x5.0
    yottaCriticalChance: 0,
    yottaCriticalDamage: 550, // x5.5
    ronnaCriticalChance: 0,
    ronnaCriticalDamage: 600, // x6.0
    quettaCriticalChance: 0,
    quettaCriticalDamage: 650, // x6.5
    xenoCriticalChance: 0,
    xenoCriticalDamage: 700, // x7.0
    ultimaCriticalChance: 0,
    ultimaCriticalDamage: 800, // x8.0
    omniCriticalChance: 0,
    omniCriticalDamage: 900, // x9.0
    absoluteCriticalChance: 0,
    absoluteCriticalDamage: 1000, // x10.0
    infinityCriticalChance: 0,
    infinityCriticalDamage: 1500, // x15.0
    statLevels: {
        critChance: 0,
        critDamage: 0,
        hyperCritChance: 0,
        hyperCritDamage: 0,
        megaCritChance: 0,
        megaCritDamage: 0,
        // New Tiers
        gigaCritChance: 0,
        gigaCritDamage: 0,
        teraCritChance: 0,
        teraCritDamage: 0,
        petaCritChance: 0,
        petaCritDamage: 0,
        exaCritChance: 0,
        exaCritDamage: 0,
        zettaCritChance: 0,
        zettaCritDamage: 0,
        yottaCritChance: 0,
        yottaCritDamage: 0,
        ronnaCritChance: 0,
        ronnaCritDamage: 0,
        quettaCritChance: 0,
        quettaCritDamage: 0,
        xenoCritChance: 0,
        xenoCritDamage: 0,
        ultimaCritChance: 0,
        ultimaCritDamage: 0,
        omniCritChance: 0,
        omniCritDamage: 0,
        absoluteCritChance: 0,
        absoluteCritDamage: 0,
        infinityCritChance: 0,
        infinityCritDamage: 0,
        moveSpeed: 0,
        attackRange: 0
    },
    obtainedWeapons: [0], // Start with weapon 0 (맨손)
    otherPlayers: {}, // { userId: { x, y, username, lastMessage, messageTimestamp, ... } }
    chatMessages: [], // [{ id, username, message, timestamp }]
    myLastMessage: null, // { message, timestamp }
    unreadChatCount: 0, // Number of unread chat messages
    // Stage System
    currentStage: { chapter: 1, stage: 1 }, // Current stage player is on
    maxStage: { chapter: 1, stage: 1 }, // Highest stage player has reached
    mushroomsCollected: 0, // Mushrooms collected in current stage
    bossTimer: null, // Boss stage timer (60 seconds)
    bossPhase: false, // For X-10 stages: false = normal 100 mushrooms, true = boss fight
    autoProgress: false, // Auto-progress to next stage when completed
    // Artifacts System
    artifacts: {
        attackBonus: { count: 0, level: 0 },
        critDamageBonus: { count: 0, level: 0 },
        hyperCritDamageBonus: { count: 0, level: 0 },
        megaCritDamageBonus: { count: 0, level: 0 },
        moveSpeed: { count: 0, level: 0 },   // New: Max +5 speed (1000Lv)
        attackRange: { count: 0, level: 0 }, // New: Max +40 range (1000Lv)
        goldBonus: { count: 0, level: 0 }
    },
    // Pet System
    pets: {
        inventory: {}, // { [petId]: count } e.g. 'slime_common': 5
        equipped: [],  // Array of petIds
        unlockedSlots: 3
    },
    // Skin System
    skins: {
        inventory: {}, // { [skinId]: count } e.g. 'skin_common_1': 1
        equipped: null, // Currently equipped skin ID
        unlocked: [] // Array of unlocked skin IDs (permanent)
    },
    lastPullResults: null, // Array of pulled artifact IDs
    // Mushroom Collection System (400 total: 100 types × 4 rarities)
    mushroomCollection: {}, // { [mushroomName]: { normal: false, rare: false, epic: false, unique: false } }
    // Collection Rewards System
    claimedRewards: {
        weapons: [],        // Array of weapon IDs that have been claimed
        mushrooms: {},      // { [mushroomName]: { normal: false, rare: false, epic: false, unique: false } }
        pets: [],           // Array of petIds (e.g. 'slime_common') that have been claimed
        skins: []           // Array of skinIds that have been claimed
    },
    // World Boss System
    worldBoss: {
        isActive: false, // Is modal open?
        isBattling: false, // Is battle in progress?
        damage: 0, // Current session damage
        totalDamage: 0, // Accumulated damage for ranking
        maxDamage: 0, // Best damage for ranking
        timeLeft: 0, // Timer
        dailyAttempts: 3, // Daily entry limit (3 per day)
        lastResetDate: new Date().toDateString() // Last reset date for daily limit
    }
};

// LocalStorage key
export const SAVE_KEY = 'mushroom_game_save';
