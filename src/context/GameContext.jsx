import React, { createContext, useReducer, useContext, useEffect } from 'react';

const GameContext = createContext();

// Generate 50 weapons procedurally with MASSIVE damage scaling
const generateWeapons = () => {
    const weaponIcons = ['✊', '🌿', '🗡️', '⚔️', '⛏️', '🔨', '🪓', '🏹', '🔱', '⚡',
        '🔥', '❄️', '�', '🌟', '👑', '🗿', '⚒️', '🛡️', '🎯', '💫',
        '🌙', '☄️', '🌊', '🌪️', '🌈', '🦅', '🐉', '🦁', '🐺', '🦈',
        '🦂', '🕷️', '🐍', '🦎', '🐊', '🦖', '🦕', '🐲', '🔮', '📿',
        '⚗️', '🧪', '💉', '🗝️', '🔐', '⚙️', '🔧', '🔩', '⛓️', '👹'];

    const weaponNames = ['맨손', '나뭇가지', '녹슨 칼', '철검', '황금 곡괭이', '전투 망치', '전쟁 도끼',
        '장궁', '삼지창', '번개검', '화염검', '얼음검', '다이아몬드 검', '별의 검', '왕의 검',
        '고대의 검', '신성한 망치', '용의 방패', '정밀 활', '별빛 창', '달의 검', '혜성 도끼',
        '파도의 창', '폭풍의 검', '무지개 활', '독수리 검', '용의 검', '사자의 도끼', '늑대의 발톱',
        '상어 이빨', '전갈 침', '거미 송곳니', '뱀의 독', '도마뱀 검', '악어 턱', '티라노 이빨',
        '브라키오 꼬리', '드래곤 클로', '마법 구슬', '성스러운 염주', '연금술 검', '독약 검',
        '주사기 창', '황금 열쇠', '봉인의 검', '기계 검', '증기 망치', '볼트 창', '사슬 도끼', '악마 검'];

    const weapons = {};
    for (let i = 0; i < 50; i++) {
        // MASSIVE damage scaling: 1, 10, 100, 1000, 10000, 100000...
        const baseDamage = i === 0 ? 1 : Math.floor(Math.pow(10, i * 0.5) * 10);
        const cost = i === 0 ? 0 : Math.floor(Math.pow(10, i * 0.6) * 100);
        const upgradeBonus = Math.max(1, Math.floor(baseDamage * 0.3));

        weapons[i] = {
            icon: weaponIcons[i],
            name: weaponNames[i],
            baseDamage: baseDamage,
            cost: cost,
            upgradeBonus: upgradeBonus
        };
    }
    return weapons;
};

const WEAPONS = generateWeapons();

// Generate 1000 maps procedurally with MASSIVE HP and reward scaling
const generateMaps = () => {
    const maps = {};
    const positions = [
        { x: 120, y: 120 },
        { x: 300, y: 120 },
        { x: 210, y: 240 },
        { x: 180, y: 180 },
        { x: 150, y: 270 }
    ];

    const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팽이버섯', '독버섯', '붉은버섯',
        '동굴버섯', '수정버섯', '얼음버섯', '용암버섯', '산악버섯', '고산버섯',
        '천둥버섯', '번개버섯', '폭풍버섯', '심연버섯', '어둠버섯', '공허버섯',
        '타락버섯', '저주버섯', '악마버섯', '거대버섯', '고대버섯', '전설버섯'];

    for (let level = 1; level <= 1000; level++) {
        const mapKey = `map_${level}`;
        const mushrooms = [];
        const mushroomCount = Math.min(3 + Math.floor(level / 100), 5);

        for (let i = 0; i < mushroomCount; i++) {
            // MASSIVE HP scaling: exponential growth
            const baseHp = Math.floor(Math.pow(10, level * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, level * 0.04) * 50);
            const pos = positions[i % positions.length];

            let type = 'normal';
            if (level > 10 && i >= mushroomCount - 1) type = 'boss';
            else if (level > 5 && i >= mushroomCount - 2) type = 'red';

            const nameIndex = Math.floor((level - 1) / 50) % mushroomNames.length;
            const name = mushroomNames[nameIndex];

            mushrooms.push({
                id: level * 100 + i + 1,
                x: pos.x,
                y: pos.y,
                hp: baseHp,
                maxHp: baseHp,
                type: type,
                name: name,
                reward: baseReward,
                isDead: false,
                respawnTime: 0
            });
        }

        maps[mapKey] = mushrooms;
    }

    return maps;
};

const MAP_DATA = generateMaps();

const initialState = {
    gold: 0,
    currentWeaponId: 0,
    weaponLevel: 0,
    clickDamage: 1,
    moveSpeed: 5,
    playerPos: { x: 400, y: 300 },
    currentScene: 'village',
    mushrooms: [],
    isLoading: false,
    isShopOpen: false,
    isPortalMenuOpen: false,
};

// LocalStorage key
const SAVE_KEY = 'mushroom_game_save';

const loadSavedState = () => {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...initialState,
                ...parsed,
                isLoading: false,
                isShopOpen: false,
                isPortalMenuOpen: false
            };
        }
    } catch (error) {
        console.error('Failed to load save:', error);
    }
    return initialState;
};

const saveState = (state) => {
    try {
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
                isLoading: false,
                isShopOpen: false
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
