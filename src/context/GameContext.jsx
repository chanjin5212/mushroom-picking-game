import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const GameContext = createContext();

// Generate 50 weapons procedurally with MASSIVE damage scaling
const generateWeapons = () => {
    const weaponIcons = ['✊', '🌿', '🗡️', '⚔️', '⛏️', '🔨', '🪓', '🏹', '🔱', '⚡',
        '🔥', '❄️', '', '🌟', '👑', '🗿', '⚒️', '🛡️', '🎯', '💫',
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
        // Cost: First weapon is free to equip, but has a 'value' for enhancement calc
        // Reduced to 1/3 for more affordable evolution
        const cost = i === 0 ? 100 : Math.floor(Math.pow(10, i * 0.6) * 100 / 3);
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
    // 20 different positions for mushrooms in a 5x4 grid with better spacing
    const positions = [
        { x: 40, y: 120 }, { x: 120, y: 120 }, { x: 200, y: 120 }, { x: 280, y: 120 }, { x: 360, y: 120 },
        { x: 40, y: 220 }, { x: 120, y: 220 }, { x: 200, y: 220 }, { x: 280, y: 220 }, { x: 360, y: 220 },
        { x: 40, y: 320 }, { x: 120, y: 320 }, { x: 200, y: 320 }, { x: 280, y: 320 }, { x: 360, y: 320 },
        { x: 40, y: 420 }, { x: 120, y: 420 }, { x: 200, y: 420 }, { x: 280, y: 420 }, { x: 360, y: 420 }
    ];

    const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팽이버섯', '독버섯', '붉은버섯',
        '동굴버섯', '수정버섯', '얼음버섯', '용암버섯', '산악버섯', '고산버섯',
        '천둥버섯', '번개버섯', '폭풍버섯', '심연버섯', '어둠버섯', '공허버섯',
        '타락버섯', '저주버섯', '악마버섯', '거대버섯', '고대버섯', '전설버섯'];

    for (let level = 1; level <= 1000; level++) {
        const mapKey = `map_${level}`;
        const mushrooms = [];
        const mushroomCount = 20; // Fixed 20 mushrooms per map

        for (let i = 0; i < mushroomCount; i++) {
            // MASSIVE HP scaling: exponential growth
            // Special case: Level 1 starts very easy (20 HP)
            const baseHp = level === 1 ? 10 : Math.floor(Math.pow(10, level * 0.05) * 100);
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
    user: null, // Add user state
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
    lastEnhanceResult: null,
    lastEvolveResult: null,
    // New Stats
    criticalChance: 0, // 0%
    criticalDamage: 150, // 150%
    hyperCriticalChance: 0, // 0% (unlocked at 50% crit)
    hyperCriticalDamage: 200, // 200% (multiplies on top of crit)
    statLevels: {
        critChance: 0,
        critDamage: 0,
        hyperCritChance: 0,
        hyperCritDamage: 0
    }
};

// LocalStorage key
const SAVE_KEY = 'mushroom_game_save';

// Removed local storage load logic for now, will rely on auth
const loadSavedState = () => {
    return initialState;
};

const saveState = async (state) => {
    if (!state.user) return; // Don't save if not logged in

    try {
        const toSave = {
            gold: state.gold,
            currentWeaponId: state.currentWeaponId,
            weaponLevel: state.weaponLevel,
            clickDamage: state.clickDamage,
            moveSpeed: state.moveSpeed,
            playerPos: state.playerPos,
            currentScene: state.currentScene,
            mushrooms: state.mushrooms,
            // Save new stats
            criticalChance: state.criticalChance,
            criticalDamage: state.criticalDamage,
            hyperCriticalChance: state.hyperCriticalChance,
            hyperCriticalDamage: state.hyperCriticalDamage,
            statLevels: state.statLevels
        };

        // Save to Supabase
        const { error } = await supabase
            .from('users')
            .update({ game_data: toSave })
            .eq('id', state.user.id);

        if (error) console.error('Failed to save to Supabase:', error);

        // Also keep local backup
        localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error('Failed to save:', error);
    }
};

// Calculate pure weapon damage (no critical)
const calculateDamage = (weaponId, level) => {
    const weapon = WEAPONS[weaponId];
    // Base damage + (Level * 10% of Base Damage), Minimum +1 per level
    const bonus = Math.ceil(weapon.baseDamage * 0.1 * level);
    const damage = weapon.baseDamage + bonus;
    return damage;
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };

        case 'LOAD_GAME_DATA':
            return {
                ...state,
                ...action.payload,
                // Force spawn at village on load
                currentScene: 'village',
                playerPos: { x: 400, y: 300 },
                isLoading: false,
                isShopOpen: false,
                isPortalMenuOpen: false
            };

        case 'LOGOUT':
            return {
                ...initialState,
                user: null
            };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'TOGGLE_SHOP':
            return { ...state, isShopOpen: !state.isShopOpen };

        case 'TOGGLE_PORTAL_MENU':
            return { ...state, isPortalMenuOpen: !state.isPortalMenuOpen };


        case 'ADD_GOLD':
            return { ...state, gold: state.gold + action.payload };

        case 'ENHANCE_WEAPON': {
            const currentWeapon = WEAPONS[state.currentWeaponId];
            // Cost: Increased with exponential scaling, Minimum 100 Gold
            const enhanceCost = Math.max(100, Math.floor(currentWeapon.cost * Math.pow(state.weaponLevel + 1, 1.5) * 0.01));

            if (state.gold < enhanceCost) return state;

            // Success Rate: 100% at lv0 -> 50% at lv10
            const successRate = 100 - (state.weaponLevel * 5);
            const isSuccess = Math.random() * 100 < successRate;

            if (isSuccess) {
                const newLevel = state.weaponLevel + 1;
                const weapon = WEAPONS[state.currentWeaponId];
                // Ensure minimum +1 damage per level
                const damagePerLevel = Math.max(1, weapon.upgradeBonus);
                const newDamage = weapon.baseDamage + (damagePerLevel * newLevel);

                return {
                    ...state,
                    gold: state.gold - enhanceCost,
                    weaponLevel: newLevel,
                    clickDamage: newDamage,
                    lastEnhanceResult: 'success'
                };
            } else {
                return {
                    ...state,
                    gold: state.gold - enhanceCost,
                    lastEnhanceResult: 'fail'
                };
            }
        }

        case 'EVOLVE_WEAPON': {
            const nextWeaponId = state.currentWeaponId + 1;
            if (!WEAPONS[nextWeaponId]) return state;

            const evolveCost = WEAPONS[nextWeaponId].cost;
            if (state.gold < evolveCost) return state;

            // Success Rate: Decreases as tier increases. Min 5%.
            // Tier 0: 100%, Tier 25: 50%, Tier 45+: 10%
            const successRate = Math.max(5, 100 - (state.currentWeaponId * 2));
            const destructionRate = 5; // Fixed 5% destruction chance

            const roll = Math.random() * 100;

            if (roll < successRate) {
                // Success
                return {
                    ...state,
                    gold: state.gold - evolveCost,
                    currentWeaponId: nextWeaponId,
                    weaponLevel: 0,
                    clickDamage: calculateDamage(nextWeaponId, 0),
                    lastEvolveResult: 'success'
                };
            } else if (roll < successRate + destructionRate) {
                // Destruction (Reset to 0)
                return {
                    ...state,
                    gold: state.gold - evolveCost,
                    weaponLevel: 0,
                    clickDamage: calculateDamage(state.currentWeaponId, 0),
                    lastEvolveResult: 'destroyed'
                };
            } else {
                // Fail (Just gold lost)
                return {
                    ...state,
                    gold: state.gold - evolveCost,
                    lastEvolveResult: 'fail'
                };
            }
        }

        case 'UPGRADE_STAT': {
            const { statType } = action.payload;

            // Helper functions to calculate costs
            const calculateTieredCost = (baseCost, level) => {
                let exponent = 1.2;
                if (level >= 100) exponent = 2.0;
                else if (level >= 10) exponent = 1.5;
                return Math.floor(baseCost * Math.pow(level + 1, exponent));
            };

            const calculateLinearCost = (baseCost, level) => {
                return Math.floor(baseCost * (level + 1));
            };

            // Calculate cost based on CURRENT state
            let cost;
            if (statType === 'critChance') {
                cost = calculateLinearCost(1000, state.statLevels?.critChance || 0);
            } else if (statType === 'critDamage') {
                cost = calculateTieredCost(800, state.statLevels?.critDamage || 0);
            } else if (statType === 'hyperCritChance') {
                cost = calculateLinearCost(10000000, state.statLevels?.hyperCritChance || 0);
            } else if (statType === 'hyperCritDamage') {
                cost = calculateTieredCost(5000000, state.statLevels?.hyperCritDamage || 0);
            }

            // Check if we have enough gold
            if (state.gold < cost) return state;

            // Check if stat can actually be upgraded before deducting gold
            if (statType === 'critChance') {
                const currentVal = state.criticalChance;
                const nextVal = parseFloat((currentVal + 0.1).toFixed(1));
                if (nextVal > 100) return state; // Already at max, don't deduct gold

                return {
                    ...state,
                    gold: state.gold - cost,
                    criticalChance: nextVal,
                    statLevels: {
                        ...state.statLevels,
                        critChance: (state.statLevels.critChance || 0) + 1
                    }
                };
            } else if (statType === 'critDamage') {
                return {
                    ...state,
                    gold: state.gold - cost,
                    criticalDamage: state.criticalDamage + 1,
                    statLevels: {
                        ...state.statLevels,
                        critDamage: (state.statLevels.critDamage || 0) + 1
                    }
                };
            } else if (statType === 'hyperCritChance') {
                const currentVal = state.hyperCriticalChance;
                const nextVal = parseFloat((currentVal + 0.1).toFixed(1));
                if (nextVal > 100) return state; // Already at max, don't deduct gold

                return {
                    ...state,
                    gold: state.gold - cost,
                    hyperCriticalChance: nextVal,
                    statLevels: {
                        ...state.statLevels,
                        hyperCritChance: (state.statLevels.hyperCritChance || 0) + 1
                    }
                };
            } else if (statType === 'hyperCritDamage') {
                return {
                    ...state,
                    gold: state.gold - cost,
                    hyperCriticalDamage: state.hyperCriticalDamage + 1,
                    statLevels: {
                        ...state.statLevels,
                        hyperCritDamage: (state.statLevels.hyperCritDamage || 0) + 1
                    }
                };
            }

            return state;
        }

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

        case 'CLEAR_RESULT_MSG':
            return { ...state, lastEnhanceResult: null, lastEvolveResult: null };

        case 'RESET_GAME':
            return {
                ...initialState,
                user: state.user, // Keep user logged in
                isLoading: false
            };

        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Removed auto-save - now manual save only

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const storedUser = localStorage.getItem('mushroom_user');
            if (!storedUser) return;

            try {
                const user = JSON.parse(storedUser);
                dispatch({ type: 'SET_LOADING', payload: true });

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data && !error) {
                    dispatch({ type: 'SET_USER', payload: { id: data.id, username: data.username } });
                    if (data.game_data) {
                        dispatch({ type: 'LOAD_GAME_DATA', payload: data.game_data });
                    }
                } else {
                    localStorage.removeItem('mushroom_user');
                }
            } catch (err) {
                console.error('Failed to restore session:', err);
                localStorage.removeItem('mushroom_user');
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        restoreSession();
    }, []);

    const login = async (username, password) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password) // Simple plaintext check as requested
                .single();

            if (error) throw new Error('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
            if (!data) throw new Error('로그인 실패: 사용자를 찾을 수 없습니다.');

            const user = { id: data.id, username: data.username };
            localStorage.setItem('mushroom_user', JSON.stringify(user));
            dispatch({ type: 'SET_USER', payload: user });

            if (data.game_data) {
                dispatch({ type: 'LOAD_GAME_DATA', payload: data.game_data });
            }
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const signup = async (username, password) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Check if user exists
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .single();

            if (existing) throw new Error('이미 존재하는 아이디입니다.');

            // Create new user
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        username,
                        password, // Storing plaintext as requested/implied by "custom auth" without backend
                        game_data: {
                            gold: 0,
                            currentWeaponId: 0,
                            weaponLevel: 0,
                            clickDamage: 1,
                            moveSpeed: 5,
                            playerPos: { x: 400, y: 300 },
                            currentScene: 'village',
                            mushrooms: [],
                            criticalChance: 0,
                            criticalDamage: 150,
                            hyperCriticalChance: 0,
                            hyperCriticalDamage: 200,
                            statLevels: { critChance: 0, critDamage: 0, hyperCritChance: 0, hyperCritDamage: 0 }
                        }
                    }
                ])
                .select()
                .single();

            if (error) throw error;



            const user = { id: data.id, username: data.username };
            localStorage.setItem('mushroom_user', JSON.stringify(user));
            dispatch({ type: 'SET_USER', payload: user });
            // Initial state is already set in reducer default, so no need to load game data for new user
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = () => {
        localStorage.removeItem('mushroom_user');
        dispatch({ type: 'LOGOUT' });
    };

    const manualSave = () => {
        if (state.user) {
            saveState(state);
            return true;
        }
        return false;
    };

    const resetGame = async () => {
        if (!state.user) return false;

        try {
            // Reset game data in database
            const { error } = await supabase
                .from('users')
                .update({
                    game_data: {
                        gold: 0,
                        currentWeaponId: 0,
                        weaponLevel: 0,
                        clickDamage: 1,
                        moveSpeed: 5,
                        playerPos: { x: 400, y: 300 },
                        currentScene: 'village',
                        mushrooms: [],
                        criticalChance: 0,
                        criticalDamage: 150,
                        hyperCriticalChance: 0,
                        hyperCriticalDamage: 200,
                        statLevels: { critChance: 0, critDamage: 0, hyperCritChance: 0, hyperCritDamage: 0 }
                    }
                })
                .eq('id', state.user.id);

            if (error) throw error;

            // Reset local state
            dispatch({ type: 'RESET_GAME' });
            return true;
        } catch (error) {
            console.error('Reset failed:', error);
            return false;
        }
    };

    return (
        <GameContext.Provider value={{ state, dispatch, WEAPONS, login, signup, logout, manualSave, resetGame, isLoading: state.isLoading }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
