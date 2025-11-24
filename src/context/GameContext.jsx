import React, { createContext, useReducer, useContext, useEffect } from 'react';

const GameContext = createContext();

const WEAPONS = {
    0: { name: '맨손', icon: '✊', baseDamage: 1, cost: 0, upgradeBonus: 1 },
    1: { name: '나뭇가지', icon: '🌿', baseDamage: 5, cost: 50, upgradeBonus: 2 },
    2: { name: '녹슨 칼', icon: '🗡️', baseDamage: 12, cost: 200, upgradeBonus: 3 },
    3: { name: '철검', icon: '⚔️', baseDamage: 25, cost: 1000, upgradeBonus: 5 },
    4: { name: '황금 곡괭이', icon: '⛏️', baseDamage: 50, cost: 5000, upgradeBonus: 10 },
};

const initialState = {
    gold: 0,
    currentWeaponId: 0,
    weaponLevel: 0,
    clickDamage: 1,
    moveSpeed: 5,
    playerPos: { x: 400, y: 300 },
    currentScene: 'village',
    mushrooms: [],
    isLoading: false, // New loading state
    isShopOpen: false, // Global shop state
    isPortalMenuOpen: false, // Portal menu state
};

// LocalStorage key
const SAVE_KEY = 'mushroom_game_save';

// Load saved state from LocalStorage
const loadSavedState = () => {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with initialState to ensure all keys exist
            return {
                ...initialState,
                ...parsed,
                isLoading: false, // Always start with loading false
                isShopOpen: false, // Always start with shop closed
                isPortalMenuOpen: false // Always start with portal menu closed
            };
        }
    } catch (error) {
        console.error('Failed to load save:', error);
    }
    return initialState;
};

// Save state to LocalStorage
const saveState = (state) => {
    try {
        // Only save persistent data, exclude UI states
        const toSave = {
            gold: state.gold,
            currentWeaponId: state.currentWeaponId,
            weaponLevel: state.weaponLevel,
            clickDamage: state.clickDamage,
            moveSpeed: state.moveSpeed,
            playerPos: state.playerPos,
            currentScene: state.currentScene,
            mushrooms: state.mushrooms
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error('Failed to save:', error);
    }
};

// Map Data - 20 Maps with Progressive Difficulty
const MAP_DATA = {
    // Beginner Maps (1-5)
    'forest_1': [
        { id: 101, x: 200, y: 200, hp: 10, maxHp: 10, type: 'normal', name: '송이버섯', reward: 5, isDead: false, respawnTime: 0 },
        { id: 102, x: 600, y: 200, hp: 10, maxHp: 10, type: 'normal', name: '송이버섯', reward: 5, isDead: false, respawnTime: 0 },
        { id: 103, x: 400, y: 400, hp: 15, maxHp: 15, type: 'normal', name: '송이버섯', reward: 8, isDead: false, respawnTime: 0 },
    ],
    'forest_2': [
        { id: 201, x: 250, y: 250, hp: 20, maxHp: 20, type: 'normal', name: '표고버섯', reward: 10, isDead: false, respawnTime: 0 },
        { id: 202, x: 550, y: 250, hp: 20, maxHp: 20, type: 'normal', name: '표고버섯', reward: 10, isDead: false, respawnTime: 0 },
        { id: 203, x: 400, y: 350, hp: 25, maxHp: 25, type: 'normal', name: '표고버섯', reward: 12, isDead: false, respawnTime: 0 },
    ],
    'forest_3': [
        { id: 301, x: 200, y: 200, hp: 30, maxHp: 30, type: 'normal', name: '느타리버섯', reward: 15, isDead: false, respawnTime: 0 },
        { id: 302, x: 600, y: 200, hp: 30, maxHp: 30, type: 'normal', name: '느타리버섯', reward: 15, isDead: false, respawnTime: 0 },
        { id: 303, x: 400, y: 400, hp: 35, maxHp: 35, type: 'normal', name: '느타리버섯', reward: 18, isDead: false, respawnTime: 0 },
        { id: 304, x: 300, y: 300, hp: 40, maxHp: 40, type: 'red', name: '작은 독버섯', reward: 20, isDead: false, respawnTime: 0 },
    ],
    'forest_4': [
        { id: 401, x: 250, y: 200, hp: 40, maxHp: 40, type: 'normal', name: '팽이버섯', reward: 20, isDead: false, respawnTime: 0 },
        { id: 402, x: 550, y: 200, hp: 40, maxHp: 40, type: 'normal', name: '팽이버섯', reward: 20, isDead: false, respawnTime: 0 },
        { id: 403, x: 400, y: 350, hp: 45, maxHp: 45, type: 'red', name: '독버섯', reward: 22, isDead: false, respawnTime: 0 },
        { id: 404, x: 300, y: 450, hp: 50, maxHp: 50, type: 'red', name: '독버섯', reward: 25, isDead: false, respawnTime: 0 },
    ],
    'forest_5': [
        { id: 501, x: 200, y: 200, hp: 50, maxHp: 50, type: 'red', name: '붉은버섯', reward: 25, isDead: false, respawnTime: 0 },
        { id: 502, x: 600, y: 200, hp: 50, maxHp: 50, type: 'red', name: '붉은버섯', reward: 25, isDead: false, respawnTime: 0 },
        { id: 503, x: 400, y: 400, hp: 60, maxHp: 60, type: 'red', name: '붉은버섯', reward: 30, isDead: false, respawnTime: 0 },
    ],

    // Intermediate Maps (6-10)
    'cave_1': [
        { id: 601, x: 250, y: 250, hp: 70, maxHp: 70, type: 'red', name: '동굴버섯', reward: 35, isDead: false, respawnTime: 0 },
        { id: 602, x: 550, y: 250, hp: 70, maxHp: 70, type: 'red', name: '동굴버섯', reward: 35, isDead: false, respawnTime: 0 },
        { id: 603, x: 400, y: 350, hp: 80, maxHp: 80, type: 'red', name: '동굴버섯', reward: 40, isDead: false, respawnTime: 0 },
        { id: 604, x: 300, y: 450, hp: 90, maxHp: 90, type: 'red', name: '빛나는버섯', reward: 45, isDead: false, respawnTime: 0 },
    ],
    'cave_2': [
        { id: 701, x: 200, y: 200, hp: 90, maxHp: 90, type: 'red', name: '수정버섯', reward: 45, isDead: false, respawnTime: 0 },
        { id: 702, x: 600, y: 200, hp: 90, maxHp: 90, type: 'red', name: '수정버섯', reward: 45, isDead: false, respawnTime: 0 },
        { id: 703, x: 400, y: 400, hp: 100, maxHp: 100, type: 'red', name: '수정버섯', reward: 50, isDead: false, respawnTime: 0 },
        { id: 704, x: 500, y: 300, hp: 110, maxHp: 110, type: 'boss', name: '동굴 수호자', reward: 60, isDead: false, respawnTime: 0 },
    ],
    'cave_3': [
        { id: 801, x: 250, y: 250, hp: 110, maxHp: 110, type: 'red', name: '얼음버섯', reward: 55, isDead: false, respawnTime: 0 },
        { id: 802, x: 550, y: 250, hp: 110, maxHp: 110, type: 'red', name: '얼음버섯', reward: 55, isDead: false, respawnTime: 0 },
        { id: 803, x: 400, y: 350, hp: 120, maxHp: 120, type: 'red', name: '얼음버섯', reward: 60, isDead: false, respawnTime: 0 },
        { id: 804, x: 300, y: 450, hp: 130, maxHp: 130, type: 'boss', name: '서리 버섯', reward: 70, isDead: false, respawnTime: 0 },
    ],
    'cave_4': [
        { id: 901, x: 200, y: 200, hp: 130, maxHp: 130, type: 'red', name: '용암버섯', reward: 65, isDead: false, respawnTime: 0 },
        { id: 902, x: 600, y: 200, hp: 130, maxHp: 130, type: 'red', name: '용암버섯', reward: 65, isDead: false, respawnTime: 0 },
        { id: 903, x: 400, y: 400, hp: 140, maxHp: 140, type: 'boss', name: '화염버섯', reward: 75, isDead: false, respawnTime: 0 },
        { id: 904, x: 500, y: 300, hp: 150, maxHp: 150, type: 'boss', name: '용암 수호자', reward: 80, isDead: false, respawnTime: 0 },
    ],
    'cave_5': [
        { id: 1001, x: 250, y: 250, hp: 150, maxHp: 150, type: 'boss', name: '거대 동굴버섯', reward: 80, isDead: false, respawnTime: 0 },
        { id: 1002, x: 550, y: 250, hp: 150, maxHp: 150, type: 'boss', name: '거대 동굴버섯', reward: 80, isDead: false, respawnTime: 0 },
        { id: 1003, x: 400, y: 350, hp: 160, maxHp: 160, type: 'boss', name: '거대 동굴버섯', reward: 85, isDead: false, respawnTime: 0 },
    ],

    // Advanced Maps (11-15)
    'mountain_1': [
        { id: 1101, x: 200, y: 200, hp: 200, maxHp: 200, type: 'boss', name: '산악버섯', reward: 100, isDead: false, respawnTime: 0 },
        { id: 1102, x: 600, y: 200, hp: 200, maxHp: 200, type: 'boss', name: '산악버섯', reward: 100, isDead: false, respawnTime: 0 },
        { id: 1103, x: 400, y: 400, hp: 220, maxHp: 220, type: 'boss', name: '바위버섯', reward: 110, isDead: false, respawnTime: 0 },
        { id: 1104, x: 300, y: 300, hp: 240, maxHp: 240, type: 'boss', name: '바위버섯', reward: 120, isDead: false, respawnTime: 0 },
    ],
    'mountain_2': [
        { id: 1201, x: 250, y: 250, hp: 250, maxHp: 250, type: 'boss', name: '고산버섯', reward: 125, isDead: false, respawnTime: 0 },
        { id: 1202, x: 550, y: 250, hp: 250, maxHp: 250, type: 'boss', name: '고산버섯', reward: 125, isDead: false, respawnTime: 0 },
        { id: 1203, x: 400, y: 350, hp: 270, maxHp: 270, type: 'boss', name: '설산버섯', reward: 135, isDead: false, respawnTime: 0 },
        { id: 1204, x: 500, y: 450, hp: 290, maxHp: 290, type: 'boss', name: '설산버섯', reward: 145, isDead: false, respawnTime: 0 },
    ],
    'mountain_3': [
        { id: 1301, x: 200, y: 200, hp: 300, maxHp: 300, type: 'boss', name: '천둥버섯', reward: 150, isDead: false, respawnTime: 0 },
        { id: 1302, x: 600, y: 200, hp: 300, maxHp: 300, type: 'boss', name: '천둥버섯', reward: 150, isDead: false, respawnTime: 0 },
        { id: 1303, x: 400, y: 400, hp: 320, maxHp: 320, type: 'boss', name: '번개버섯', reward: 160, isDead: false, respawnTime: 0 },
        { id: 1304, x: 300, y: 300, hp: 340, maxHp: 340, type: 'boss', name: '폭풍버섯', reward: 170, isDead: false, respawnTime: 0 },
    ],
    'mountain_4': [
        { id: 1401, x: 250, y: 250, hp: 350, maxHp: 350, type: 'boss', name: '거대 산악버섯', reward: 175, isDead: false, respawnTime: 0 },
        { id: 1402, x: 550, y: 250, hp: 350, maxHp: 350, type: 'boss', name: '거대 산악버섯', reward: 175, isDead: false, respawnTime: 0 },
        { id: 1403, x: 400, y: 350, hp: 370, maxHp: 370, type: 'boss', name: '거대 산악버섯', reward: 185, isDead: false, respawnTime: 0 },
        { id: 1404, x: 500, y: 450, hp: 390, maxHp: 390, type: 'boss', name: '산의 수호자', reward: 195, isDead: false, respawnTime: 0 },
    ],
    'mountain_5': [
        { id: 1501, x: 200, y: 200, hp: 400, maxHp: 400, type: 'boss', name: '정상버섯', reward: 200, isDead: false, respawnTime: 0 },
        { id: 1502, x: 600, y: 200, hp: 400, maxHp: 400, type: 'boss', name: '정상버섯', reward: 200, isDead: false, respawnTime: 0 },
        { id: 1503, x: 400, y: 400, hp: 420, maxHp: 420, type: 'boss', name: '정상버섯', reward: 210, isDead: false, respawnTime: 0 },
    ],

    // Expert Maps (16-19)
    'abyss_1': [
        { id: 1601, x: 250, y: 250, hp: 500, maxHp: 500, type: 'boss', name: '심연버섯', reward: 250, isDead: false, respawnTime: 0 },
        { id: 1602, x: 550, y: 250, hp: 500, maxHp: 500, type: 'boss', name: '심연버섯', reward: 250, isDead: false, respawnTime: 0 },
        { id: 1603, x: 400, y: 350, hp: 550, maxHp: 550, type: 'boss', name: '어둠버섯', reward: 275, isDead: false, respawnTime: 0 },
        { id: 1604, x: 300, y: 450, hp: 600, maxHp: 600, type: 'boss', name: '어둠버섯', reward: 300, isDead: false, respawnTime: 0 },
    ],
    'abyss_2': [
        { id: 1701, x: 200, y: 200, hp: 650, maxHp: 650, type: 'boss', name: '공허버섯', reward: 325, isDead: false, respawnTime: 0 },
        { id: 1702, x: 600, y: 200, hp: 650, maxHp: 650, type: 'boss', name: '공허버섯', reward: 325, isDead: false, respawnTime: 0 },
        { id: 1703, x: 400, y: 400, hp: 700, maxHp: 700, type: 'boss', name: '혼돈버섯', reward: 350, isDead: false, respawnTime: 0 },
        { id: 1704, x: 500, y: 300, hp: 750, maxHp: 750, type: 'boss', name: '혼돈버섯', reward: 375, isDead: false, respawnTime: 0 },
    ],
    'abyss_3': [
        { id: 1801, x: 250, y: 250, hp: 800, maxHp: 800, type: 'boss', name: '타락버섯', reward: 400, isDead: false, respawnTime: 0 },
        { id: 1802, x: 550, y: 250, hp: 800, maxHp: 800, type: 'boss', name: '타락버섯', reward: 400, isDead: false, respawnTime: 0 },
        { id: 1803, x: 400, y: 350, hp: 850, maxHp: 850, type: 'boss', name: '저주버섯', reward: 425, isDead: false, respawnTime: 0 },
        { id: 1804, x: 300, y: 450, hp: 900, maxHp: 900, type: 'boss', name: '저주버섯', reward: 450, isDead: false, respawnTime: 0 },
    ],
    'abyss_4': [
        { id: 1901, x: 200, y: 200, hp: 950, maxHp: 950, type: 'boss', name: '악마버섯', reward: 475, isDead: false, respawnTime: 0 },
        { id: 1902, x: 600, y: 200, hp: 950, maxHp: 950, type: 'boss', name: '악마버섯', reward: 475, isDead: false, respawnTime: 0 },
        { id: 1903, x: 400, y: 400, hp: 1000, maxHp: 1000, type: 'boss', name: '악마버섯', reward: 500, isDead: false, respawnTime: 0 },
    ],

    // Final Boss Map (20)
    'throne': [
        { id: 2001, x: 400, y: 300, hp: 2000, maxHp: 2000, type: 'boss', name: '버섯 대왕', reward: 1000, isDead: false, respawnTime: 0 },
    ]
};

const calculateDamage = (weaponId, level) => {
    const weapon = WEAPONS[weaponId];
    return weapon.baseDamage + (level * weapon.upgradeBonus);
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'TOGGLE_SHOP':
            return { ...state, isShopOpen: !state.isShopOpen };

        case 'TOGGLE_PORTAL_MENU':
            return { ...state, isPortalMenuOpen: !state.isPortalMenuOpen };

        case 'ADD_GOLD':
            return { ...state, gold: state.gold + action.payload };

        case 'BUY_WEAPON':
            const nextWeaponId = state.currentWeaponId + 1;
            if (WEAPONS[nextWeaponId] && state.gold >= WEAPONS[nextWeaponId].cost) {
                return {
                    ...state,
                    gold: state.gold - WEAPONS[nextWeaponId].cost,
                    currentWeaponId: nextWeaponId,
                    weaponLevel: 0,
                    clickDamage: calculateDamage(nextWeaponId, 0)
                };
            }
            return state;

        case 'UPGRADE_WEAPON':
            const currentWeapon = WEAPONS[state.currentWeaponId];
            const upgradeCost = Math.floor(currentWeapon.baseDamage * 2 * Math.pow(1.3, state.weaponLevel));
            if (state.gold >= upgradeCost) {
                return {
                    ...state,
                    gold: state.gold - upgradeCost,
                    weaponLevel: state.weaponLevel + 1,
                    clickDamage: calculateDamage(state.currentWeaponId, state.weaponLevel + 1)
                };
            }
            return state;

        case 'SET_PLAYER_POS':
            return { ...state, playerPos: action.payload };

        case 'SWITCH_SCENE':
            const newScene = action.payload.scene;
            let newMushrooms = [];
            if (MAP_DATA[newScene]) {
                newMushrooms = JSON.parse(JSON.stringify(MAP_DATA[newScene]));
            }
            return {
                ...state,
                currentScene: newScene,
                playerPos: action.payload.pos,
                mushrooms: newMushrooms,
                isLoading: false, // Turn off loading when scene switches
                isShopOpen: false // Close shop when switching scenes
            };

        case 'DAMAGE_MUSHROOM':
            return {
                ...state,
                mushrooms: state.mushrooms.map(m => {
                    if (m.id === action.payload.id) {
                        const newHp = m.hp - action.payload.damage;
                        if (newHp <= 0) {
                            return { ...m, hp: 0, isDead: true, respawnTime: Date.now() + 1000 };
                        }
                        return { ...m, hp: newHp };
                    }
                    return m;
                })
            };

        case 'RESPAWN_MUSHROOM':
            return {
                ...state,
                mushrooms: state.mushrooms.map(m => {
                    if (m.id === action.payload.id) {
                        return { ...m, hp: m.maxHp, isDead: false, respawnTime: 0 };
                    }
                    return m;
                })
            };

        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState, loadSavedState);

    // Auto-save whenever state changes
    useEffect(() => {
        saveState(state);
    }, [state]);

    return (
        <GameContext.Provider value={{ state, dispatch, WEAPONS }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
