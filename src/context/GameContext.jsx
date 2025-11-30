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
    attackRange: 80, // Base attack range
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
        hyperCritDamage: 0,
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
    autoProgress: false // Auto-progress to next stage when completed
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
            statLevels: state.statLevels,
            statLevels: state.statLevels,
            obtainedWeapons: state.obtainedWeapons,
            attackRange: state.attackRange,
            // Stage System - save currentStage and maxStage only
            currentStage: state.currentStage,
            maxStage: state.maxStage
            // Do NOT save mushroomsCollected or bossPhase - always start fresh
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

        case 'UPDATE_BOSS_TIMER':
            return { ...state, bossTimer: action.payload };

        case 'SET_BOSS_PHASE':
            return {
                ...state,
                bossPhase: true,
                bossTimer: 60,
                mushrooms: action.payload.mushrooms
            };

        case 'LOAD_GAME_DATA':
            return {
                ...state,
                ...action.payload,
                // Ensure stage state exists if loading old data
                currentStage: action.payload.currentStage || { chapter: 1, stage: 1 },
                maxStage: action.payload.maxStage || { chapter: 1, stage: 1 },
                // Always reset progress on load
                mushroomsCollected: 0,
                bossPhase: false,
                bossTimer: null,
                // Always start in village
                currentScene: 'village',
                // Force spawn at village on load
                playerPos: { x: 400, y: 300 },
                isLoading: false,
                isShopOpen: false,
                isPortalMenuOpen: false,
                // Clear mushrooms on load to prevent sync issues
                mushrooms: []
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

        case 'TOGGLE_AUTO_PROGRESS':
            return { ...state, autoProgress: !state.autoProgress };


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
                // Success - add new weapon to obtained list
                const newObtainedWeapons = state.obtainedWeapons.includes(nextWeaponId)
                    ? state.obtainedWeapons
                    : [...state.obtainedWeapons, nextWeaponId];

                return {
                    ...state,
                    gold: state.gold - evolveCost,
                    currentWeaponId: nextWeaponId,
                    weaponLevel: 0,
                    clickDamage: calculateDamage(nextWeaponId, 0),
                    obtainedWeapons: newObtainedWeapons,
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
            const { statType, count = 1 } = action.payload;

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

            let totalCost = 0;
            let currentLevel = 0;
            let currentVal = 0;
            let maxLevel = 0;
            let baseCost = 0;
            let isTiered = false;

            // Determine stat parameters
            if (statType === 'critChance') {
                currentLevel = state.statLevels?.critChance || 0;
                currentVal = state.criticalChance;
                maxLevel = 1000;
                baseCost = 1000;
                isTiered = false;
            } else if (statType === 'critDamage') {
                currentLevel = state.statLevels?.critDamage || 0;
                currentVal = state.criticalDamage;
                maxLevel = Infinity;
                baseCost = 800;
                isTiered = true;
            } else if (statType === 'hyperCritChance') {
                currentLevel = state.statLevels?.hyperCritChance || 0;
                currentVal = state.hyperCriticalChance;
                maxLevel = 1000;
                baseCost = 10000000;
                isTiered = false;
            } else if (statType === 'hyperCritDamage') {
                currentLevel = state.statLevels?.hyperCritDamage || 0;
                currentVal = state.hyperCriticalDamage;
                maxLevel = Infinity;
                baseCost = 5000000;
                isTiered = true;
            } else if (statType === 'moveSpeed') {
                currentLevel = state.statLevels?.moveSpeed || 0;
                currentVal = state.moveSpeed;
                maxLevel = 300;
                baseCost = 500;
                isTiered = true;
            } else if (statType === 'attackRange') {
                currentLevel = state.statLevels?.attackRange || 0;
                currentVal = state.attackRange;
                maxLevel = 300;
                baseCost = 500;
                isTiered = true;
            }

            // Calculate total cost and valid count
            let validCount = 0;
            let tempLevel = currentLevel;

            for (let i = 0; i < count; i++) {
                if (tempLevel >= maxLevel && maxLevel !== Infinity) break;

                let stepCost = isTiered
                    ? calculateTieredCost(baseCost, tempLevel)
                    : calculateLinearCost(baseCost, tempLevel);

                totalCost += stepCost;
                tempLevel++;
                validCount++;
            }

            if (validCount === 0) return state;
            if (state.gold < totalCost) return state;

            // Apply upgrades
            const newState = {
                ...state,
                gold: state.gold - totalCost,
                statLevels: { ...state.statLevels }
            };

            if (statType === 'critChance') {
                newState.criticalChance = parseFloat((state.criticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.critChance = currentLevel + validCount;
            } else if (statType === 'critDamage') {
                newState.criticalDamage = state.criticalDamage + (1 * validCount);
                newState.statLevels.critDamage = currentLevel + validCount;
            } else if (statType === 'hyperCritChance') {
                newState.hyperCriticalChance = parseFloat((state.hyperCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.hyperCritChance = currentLevel + validCount;
            } else if (statType === 'hyperCritDamage') {
                newState.hyperCriticalDamage = state.hyperCriticalDamage + (1 * validCount);
                newState.statLevels.hyperCritDamage = currentLevel + validCount;
            } else if (statType === 'moveSpeed') {
                // Formula: 5 + (10 * level / 300)
                const newLevel = currentLevel + validCount;
                newState.moveSpeed = 5 + (10 * newLevel / 300);
                newState.statLevels.moveSpeed = newLevel;
            } else if (statType === 'attackRange') {
                // Formula: 80 + (80 * level / 300)
                const newLevel = currentLevel + validCount;
                newState.attackRange = 80 + (80 * newLevel / 300);
                newState.statLevels.attackRange = newLevel;
            }

            return newState;
        }

        case 'SET_PLAYER_POS':
            return { ...state, playerPos: action.payload };

        case 'UPDATE_OTHER_PLAYERS':
            return { ...state, otherPlayers: action.payload };

        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: [...state.chatMessages, action.payload.message],
                // Don't increment unread count if chat is open or if it's my own message
                unreadChatCount: (action.payload.isChatOpen || action.payload.message.username === state.user?.username)
                    ? state.unreadChatCount
                    : state.unreadChatCount + 1
            };

        case 'CLEAR_CHAT_MESSAGES':
            return { ...state, chatMessages: [] };

        case 'SET_MY_LAST_MESSAGE':
            return { ...state, myLastMessage: action.payload };

        case 'CLEAR_UNREAD_CHAT':
            return { ...state, unreadChatCount: 0 };

        // Stage System Actions
        case 'START_STAGE': {
            const { chapter, stage } = action.payload;
            const isBossStage = stage === 10; // Keep this for bossTimer
            const difficultyLevel = (chapter - 1) * 10 + stage;
            let newMushrooms = [];

            // Always generate normal mushrooms (100 mushrooms)
            const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팝이버섯', '독버섯', '붉은버섯', '동굴버섯', '수정버섯', '얼음버섯', '용암버섯'];
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);

            for (let i = 0; i < 100; i++) {
                const x = 40 + Math.random() * 320;
                const y = 120 + Math.random() * 300;

                newMushrooms.push({
                    id: Date.now() + i + Math.random(),
                    x, y,
                    hp: baseHp,
                    maxHp: baseHp,
                    type: 'normal',
                    name: mushroomNames[Math.floor(Math.random() * mushroomNames.length)],
                    reward: baseReward,
                    isDead: false,
                    respawnTime: 0
                });
            }

            return {
                ...state,
                currentStage: action.payload,
                mushroomsCollected: 0,
                bossTimer: null, // No timer until boss spawns
                bossPhase: false, // Start with normal mushrooms
                mushrooms: newMushrooms,
                currentScene: 'stage'
            };
        }

        case 'COLLECT_MUSHROOM': {
            const newCount = state.mushroomsCollected + 1;
            // Just increment count, don't auto-spawn boss
            return { ...state, mushroomsCollected: newCount };
        }

        case 'COMPLETE_STAGE': {
            const { chapter, stage } = state.currentStage;
            let nextStage;

            if (stage === 10) {
                // Boss cleared, go to next chapter
                nextStage = { chapter: chapter + 1, stage: 1 };
            } else {
                // Normal stage cleared, go to next stage
                nextStage = { chapter, stage: stage + 1 };
            }

            // Update maxStage if this is a new record
            const isNewRecord =
                nextStage.chapter > state.maxStage.chapter ||
                (nextStage.chapter === state.maxStage.chapter && nextStage.stage > state.maxStage.stage);

            // Generate mushrooms for next stage
            const isBossStage = nextStage.stage === 10;
            const difficultyLevel = (nextStage.chapter - 1) * 10 + nextStage.stage;
            let newMushrooms = [];

            // Always generate normal mushrooms (100 mushrooms) - same as START_STAGE and SELECT_STAGE
            const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팝이버섯', '독버섯', '붉은버섯', '동굴버섯', '수정버섯', '얼음버섯', '용암버섯'];
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);

            for (let i = 0; i < 100; i++) {
                const x = 40 + Math.random() * 320;
                const y = 120 + Math.random() * 300;

                newMushrooms.push({
                    id: Date.now() + i + Math.random(),
                    x, y,
                    hp: baseHp,
                    maxHp: baseHp,
                    type: 'normal',
                    name: mushroomNames[Math.floor(Math.random() * mushroomNames.length)],
                    reward: baseReward,
                    isDead: false,
                    respawnTime: 0
                });
            }

            return {
                ...state,
                currentStage: nextStage,
                maxStage: isNewRecord ? nextStage : state.maxStage,
                mushroomsCollected: 0,
                bossTimer: null, // No timer until boss spawns
                bossPhase: false, // Start with normal mushrooms
                mushrooms: newMushrooms
            };
        }

        case 'UPDATE_BOSS_TIMER':
            return {
                ...state,
                bossTimer: action.payload
            };

        case 'SELECT_STAGE': {
            const { chapter, stage } = action.payload;
            const difficultyLevel = (chapter - 1) * 10 + stage;
            let newMushrooms = [];

            // Always generate normal mushrooms (100 mushrooms) - same as START_STAGE
            const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팝이버섯', '독버섯', '붉은버섯', '동굴버섯', '수정버섯', '얼음버섯', '용암버섯'];
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);

            for (let i = 0; i < 100; i++) {
                const x = 40 + Math.random() * 320;
                const y = 120 + Math.random() * 300;

                newMushrooms.push({
                    id: Date.now() + i + Math.random(),
                    x, y,
                    hp: baseHp,
                    maxHp: baseHp,
                    type: 'normal',
                    name: mushroomNames[Math.floor(Math.random() * mushroomNames.length)],
                    reward: baseReward,
                    isDead: false,
                    respawnTime: 0
                });
            }

            return {
                ...state,
                currentStage: action.payload,
                mushroomsCollected: 0,
                bossTimer: null, // No timer until boss spawns
                bossPhase: false, // Start with normal mushrooms
                mushrooms: newMushrooms,
                currentScene: 'stage'
            };
        }

        case 'SWITCH_SCENE': {
            // Deprecated but kept for compatibility if needed, though we use NEXT_STAGE now
            const newScene = action.payload.scene;
            let newMushrooms = [];
            if (MAP_DATA[newScene]) {
                newMushrooms = JSON.parse(JSON.stringify(MAP_DATA[newScene]));
            }
            return {
                ...state,
                currentScene: newScene,
                playerPos: newScene === 'village' ? { x: 400, y: 300 } : state.playerPos,
                // Clear boss state when returning to village
                bossTimer: newScene === 'village' ? null : state.bossTimer,
                bossPhase: newScene === 'village' ? false : state.bossPhase,
                mushroomsCollected: newScene === 'village' ? 0 : state.mushroomsCollected,
                mushrooms: newMushrooms,
                isLoading: false,
                isShopOpen: false
            };
        }

        case 'NEXT_STAGE': {
            // Advance stage logic
            let nextChapter = state.stage.chapter;
            let nextLevel = state.stage.level + 1;

            if (nextLevel > 10) {
                nextChapter += 1;
                nextLevel = 1;
            }

            const newStage = { chapter: nextChapter, level: nextLevel };

            // Update max stage if reached new peak
            let newMaxStage = state.maxStage;
            if (nextChapter > state.maxStage.chapter || (nextChapter === state.maxStage.chapter && nextLevel > state.maxStage.level)) {
                newMaxStage = newStage;
            }

            // Generate mobs for new stage
            // Difficulty scaling: (Chapter - 1) * 10 + Level
            const difficultyLevel = (nextChapter - 1) * 10 + nextLevel;

            // Generate 20 mobs
            const stageMushrooms = [];
            const mushroomNames = ['송이버섯', '표고버섯', '느타리버섯', '팽이버섯', '독버섯', '붉은버섯', '동굴버섯', '수정버섯', '얼음버섯', '용암버섯'];

            for (let i = 0; i < 20; i++) {
                const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
                const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);

                // Random position
                const x = 40 + Math.random() * 320;
                const y = 120 + Math.random() * 300;

                stageMushrooms.push({
                    id: Date.now() + i,
                    x, y,
                    hp: baseHp,
                    maxHp: baseHp,
                    type: 'normal',
                    name: mushroomNames[Math.floor(Math.random() * mushroomNames.length)],
                    reward: baseReward,
                    isDead: false,
                    respawnTime: 0
                });
            }

            return {
                ...state,
                stage: newStage,
                stageProgress: 0,
                maxStage: newMaxStage,
                isBossActive: false,
                mushrooms: stageMushrooms,
                playerPos: { x: 400, y: 300 } // Reset player pos
            };
        }

        case 'SPAWN_BOSS': {
            // Clear all mobs and spawn ONE big boss
            const difficultyLevel = (state.stage.chapter - 1) * 10 + state.stage.level;
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const bossHp = baseHp * 1000; // 1000x HP
            const bossReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50) * 100; // 100x Reward

            const bossMushroom = {
                id: 'BOSS',
                x: 200,
                y: 200,
                hp: bossHp,
                maxHp: bossHp,
                type: 'boss',
                name: `Chapter ${state.stage.chapter} BOSS`,
                reward: bossReward,
                isDead: false,
                respawnTime: 0,
                scale: 3 // Visual scale
            };

            return {
                ...state,
                isBossActive: true,
                mushrooms: [bossMushroom]
            };
        }

        case 'DAMAGE_MUSHROOM':
            return {
                ...state,
                mushrooms: state.mushrooms.map(m => {
                    if (m.id === action.payload.id) {
                        const newHp = m.hp - action.payload.damage;
                        if (newHp <= 0) {
                            // If boss is killed, auto advance to next stage (which will be X-1)
                            // But we might want to let user see the victory first?
                            // For now, just mark dead. The KILL_MUSHROOM reducer will handle progress.
                            return { ...m, hp: 0, isDead: true, respawnTime: Date.now() + 1000 };
                        }
                        return { ...m, hp: newHp };
                    }
                    return m;
                })
            };

        case 'KILL_MUSHROOM': {
            // Called when animation finishes or logic detects death
            // Increment progress
            const newProgress = state.stageProgress + 1;

            // If boss was killed, we should probably trigger something special or allow next stage
            // But for now, just increment progress. 
            // If it was a boss stage (level 10) and boss died, progress should be set to 100 (complete)

            let finalProgress = newProgress;
            if (state.isBossActive) {
                // Boss killed!
                finalProgress = 100; // Force complete
            }

            return {
                ...state,
                stageProgress: finalProgress
            };
        }

        case 'RESPAWN_MUSHROOM':
            return {
                ...state,
                mushrooms: state.mushrooms.map(m => {
                    if (m.id === action.payload.id) {
                        // Don't respawn boss
                        if (m.type === 'boss') return m;
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

    // Auto-save every 10 seconds
    useEffect(() => {
        if (!state.user) return;

        const saveInterval = setInterval(() => {
            saveState(state);
        }, 10000);

        return () => clearInterval(saveInterval);
    }, [state.user, state]); // Depend on state to save latest data

    // Save immediately when stage changes
    useEffect(() => {
        if (state.user) {
            saveState(state);
        }
    }, [state.currentStage, state.maxStage]); // Save on stage progress

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
        restoreSession();
    }, []);

    // Realtime Presence Logic
    const channelRef = React.useRef(null);
    const previousPresenceRef = React.useRef({}); // Track previous presence state

    useEffect(() => {
        if (!state.user) return;

        // Only connect to village channel if in village
        if (state.currentScene !== 'village') {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            // Clear previous presence when leaving village
            previousPresenceRef.current = {};
            return;
        }

        // console.log('Attempting to connect to room:village...');

        const channel = supabase.channel('room:village', {
            config: {
                presence: {
                    key: state.user.id,
                },
            },
        });

        channelRef.current = channel;

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                // console.log('Presence Sync:', newState);
                const players = {};

                // Detect joins and leaves by comparing with previous state
                const currentUserIds = new Set(Object.keys(newState));
                const previousUserIds = new Set(Object.keys(previousPresenceRef.current));

                // Detect new joins - broadcast to all users
                currentUserIds.forEach(userId => {
                    if (!previousUserIds.has(userId) && userId !== state.user.id) {
                        const joinedUser = newState[userId][0];
                        if (joinedUser && chatChannelRef.current) {
                            const systemMessage = {
                                id: Date.now() + Math.random(),
                                username: 'SYSTEM',
                                message: `${joinedUser.username}님이 입장하였습니다`,
                                timestamp: Date.now(),
                                isSystem: true
                            };
                            // Broadcast to all users
                            chatChannelRef.current.send({
                                type: 'broadcast',
                                event: 'chat_message',
                                payload: systemMessage
                            });
                            // Also add locally
                            dispatch({
                                type: 'ADD_CHAT_MESSAGE',
                                payload: {
                                    message: systemMessage,
                                    isChatOpen: isChatOpenRef.current
                                }
                            });
                        }
                    }
                });

                // Detect leaves - broadcast to all users
                previousUserIds.forEach(userId => {
                    if (!currentUserIds.has(userId) && userId !== state.user.id) {
                        const leftUser = previousPresenceRef.current[userId][0];
                        if (leftUser && chatChannelRef.current) {
                            const systemMessage = {
                                id: Date.now() + Math.random(),
                                username: 'SYSTEM',
                                message: `${leftUser.username}님이 퇴장하였습니다`,
                                timestamp: Date.now(),
                                isSystem: true
                            };
                            // Broadcast to all users
                            chatChannelRef.current.send({
                                type: 'broadcast',
                                event: 'chat_message',
                                payload: systemMessage
                            });
                            // Also add locally
                            dispatch({
                                type: 'ADD_CHAT_MESSAGE',
                                payload: {
                                    message: systemMessage,
                                    isChatOpen: isChatOpenRef.current
                                }
                            });
                        }
                    }
                });

                // Update previous state
                previousPresenceRef.current = newState;

                Object.keys(newState).forEach(key => {
                    if (key === state.user.id) return; // Skip self

                    const presence = newState[key][0]; // Take the first presence for this user
                    if (presence) {
                        players[key] = presence;
                    }
                });

                dispatch({ type: 'UPDATE_OTHER_PLAYERS', payload: players });
            })
            .subscribe(async (status) => {
                console.log('Subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    // Initial track
                    await channel.track({
                        username: state.user.username,
                        x: state.playerPos.x,
                        y: state.playerPos.y,
                        scene: state.currentScene,
                        lastMessage: state.myLastMessage?.message || null,
                        messageTimestamp: state.myLastMessage?.timestamp || null
                    });
                }
            });

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [state.user?.id, state.currentScene]);

    // Broadcast Position Updates
    useEffect(() => {
        if (!state.user || state.currentScene !== 'village') return;

        if (channelRef.current) {
            // console.log('Sending update:', state.playerPos); // Uncomment for verbose logs
            channelRef.current.track({
                username: state.user.username,
                x: state.playerPos.x,
                y: state.playerPos.y,
                scene: state.currentScene,
                lastMessage: state.myLastMessage?.message || null,
                messageTimestamp: state.myLastMessage?.timestamp || null
            });
        }
    }, [state.playerPos, state.currentScene, state.myLastMessage]);

    // Chat Broadcast Logic - Global (works in all scenes)
    const chatChannelRef = React.useRef(null);
    const isChatOpenRef = React.useRef(false);

    const setChatOpen = (isOpen) => {
        isChatOpenRef.current = isOpen;
    };

    useEffect(() => {
        if (!state.user) {
            if (chatChannelRef.current) {
                supabase.removeChannel(chatChannelRef.current);
                chatChannelRef.current = null;
            }
            return;
        }

        const chatChannel = supabase.channel('room:global:chat');
        chatChannelRef.current = chatChannel;

        chatChannel
            .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
                dispatch({
                    type: 'ADD_CHAT_MESSAGE',
                    payload: {
                        message: payload,
                        isChatOpen: isChatOpenRef.current
                    }
                });
            })
            .subscribe();

        return () => {
            if (chatChannelRef.current) {
                supabase.removeChannel(chatChannelRef.current);
                chatChannelRef.current = null;
            }
        };
    }, [state.user?.id]);

    const sendChatMessage = (message) => {
        if (!chatChannelRef.current || !state.user || !message.trim()) return;

        const chatMessage = {
            id: Date.now() + Math.random(),
            username: state.user.username,
            message: message.trim(),
            timestamp: Date.now()
        };

        // Add to local state immediately
        dispatch({
            type: 'ADD_CHAT_MESSAGE',
            payload: {
                message: chatMessage,
                isChatOpen: isChatOpenRef.current
            }
        });

        // Set my last message for bubble display (only in village)
        if (state.currentScene === 'village') {
            dispatch({
                type: 'SET_MY_LAST_MESSAGE',
                payload: { message: message.trim(), timestamp: Date.now() }
            });

            // Auto-clear after 5 seconds
            setTimeout(() => {
                dispatch({ type: 'SET_MY_LAST_MESSAGE', payload: null });
            }, 5000);
        }

        // Broadcast to others
        chatChannelRef.current.send({
            type: 'broadcast',
            event: 'chat_message',
            payload: chatMessage
        });
    };


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
                            statLevels: { critChance: 0, critDamage: 0, hyperCritChance: 0, hyperCritDamage: 0, moveSpeed: 0, attackRange: 0 },
                            obtainedWeapons: [0]
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

    const fetchRankings = async (sortBy = 'weapon') => {
        try {
            // Fetch all users (limit to 100 for performance)
            const { data, error } = await supabase
                .from('users')
                .select('username, game_data')
                .limit(100);

            if (error) throw error;

            let sorted = [];

            if (sortBy === 'stage') {
                // Sort by Max Stage (desc)
                sorted = data.sort((a, b) => {
                    const stageA = a.game_data?.maxStage || { chapter: 1, stage: 1 };
                    const stageB = b.game_data?.maxStage || { chapter: 1, stage: 1 };

                    if (stageA.chapter !== stageB.chapter) {
                        return stageB.chapter - stageA.chapter;
                    }
                    return stageB.stage - stageA.stage;
                });
            } else {
                // Default: Sort by Weapon ID (desc) then Weapon Level (desc)
                sorted = data.sort((a, b) => {
                    const weaponIdA = a.game_data?.currentWeaponId || 0;
                    const weaponIdB = b.game_data?.currentWeaponId || 0;
                    if (weaponIdA !== weaponIdB) return weaponIdB - weaponIdA;

                    const levelA = a.game_data?.weaponLevel || 0;
                    const levelB = b.game_data?.weaponLevel || 0;
                    return levelB - levelA;
                });
            }

            return sorted;
        } catch (error) {
            console.error('Failed to fetch rankings:', error);
            return [];
        }
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
                        statLevels: { critChance: 0, critDamage: 0, hyperCritChance: 0, hyperCritDamage: 0, moveSpeed: 0, attackRange: 0 },
                        obtainedWeapons: [0]
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
        <GameContext.Provider value={{
            state,
            dispatch,
            WEAPONS,
            login,
            signup,
            logout,
            manualSave,
            fetchRankings,
            resetGame,
            sendChatMessage,
            setChatOpen,
            isLoading: state.isLoading
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
