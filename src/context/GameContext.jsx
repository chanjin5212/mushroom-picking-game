import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const GameContext = createContext();

// Generate 100 weapons procedurally with MASSIVE damage scaling
const generateWeapons = () => {
    const weaponIcons = ['✊', '🌿', '🗡️', '⚔️', '⛏️', '🔨', '🪓', '🏹', '🔱', '⚡',
        '🔥', '❄️', '🌟', '🌟', '👑', '🗿', '⚒️', '🛡️', '🎯', '💫',
        '🌙', '☄️', '🌊', '🌪️', '🌈', '🦅', '🐉', '🦁', '🐺', '🦈',
        '🦂', '🕷️', '🐍', '🦎', '🐊', '🦖', '🦕', '🐲', '🔮', '📿',
        '⚗️', '🧪', '💉', '🗝️', '🔐', '⚙️', '🔧', '🔩', '⛓️', '👹',
        '🌌', '💎', '🏆', '⭐', '🎭', '🎪', '🎨', '🎬', '🎮', '🎰',
        '🎲', '🃏', '🎴', '🀄', '🎯', '🎱', '🔮', '🧿', '📿', '💍',
        '👑', '🗡️', '⚔️', '🛡️', '🏹', '🔱', '⚡', '🔥', '❄️', '🌟',
        '💫', '🌙', '☄️', '🌊', '🌪️', '🌈', '🦅', '🐉', '🦁', '🐺',
        '🦈', '🦂', '🕷️', '🐍', '🦎', '🐊', '🦖', '🦕', '🐲', '👹'];

    const weaponNames = ['맨손', '나뭇가지', '녹슨 칼', '철검', '황금 곡괭이', '전투 망치', '전쟁 도끼',
        '장궁', '삼지창', '번개검', '화염검', '얼음검', '다이아몬드 검', '별의 검', '왕의 검',
        '고대의 검', '신성한 망치', '용의 방패', '정밀 활', '별빛 창', '달의 검', '혜성 도끼',
        '파도의 창', '폭풍의 검', '무지개 활', '독수리 검', '용의 검', '사자의 도끼', '늑대의 발톱',
        '상어 이빨', '전갈 침', '거미 송곳니', '뱀의 독', '도마뱀 검', '악어 턱', '티라노 이빨',
        '브라키오 꼬리', '드래곤 클로', '마법 구슬', '성스러운 염주', '연금술 검', '독약 검',
        '주사기 창', '황금 열쇠', '봉인의 검', '기계 검', '증기 망치', '볼트 창', '사슬 도끼', '악마 검',
        '은하수 검', '다이아몬드 창', '챔피언 검', '전설의 검', '환영의 검', '서커스 검', '예술의 검',
        '영화의 검', '게임의 검', '행운의 검', '주사위 검', '조커 검', '카드 검', '마작 검',
        '다트 검', '당구 검', '수정구 검', '악마의 눈', '신성한 염주', '마법 반지',
        '황제의 왕관', '성검 엑스칼리버', '신성한 성검', '천사의 방패', '천상의 활', '신의 삼지창',
        '천둥의 검', '지옥의 화염검', '절대영도 검', '초신성 검', '혜성 검', '달빛 검',
        '유성 검', '해일 검', '태풍 검', '오로라 검', '천공의 독수리', '신룡의 검', '백수의 왕',
        '달의 늑대', '심해의 상어', '사막의 전갈', '독거미 검', '독사의 송곳니', '카멜레온 검',
        '나일의 악어', '공룡왕 검', '고대 공룡', '신화의 용', '마왕의 검'];

    const weapons = {};
    for (let i = 0; i < 100; i++) {
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

// 100 different mushroom types - changes every 25 chapters (max chapter: 2500)
const MUSHROOM_NAMES = [
    '팽이버섯', '느타리버섯', '표고버섯', '송이버섯', '양송이버섯',
    '목이버섯', '석이버섯', '영지버섯', '상황버섯', '동충하초',
    '싸리버섯', '꽃송이버섯', '노루궁뎅이버섯', '차가버섯', '아가리쿠스버섯',
    '새송이버섯', '만가닥버섯', '잎새버섯', '능이버섯', '복령버섯',
    '독버섯', '광대버섯', '붉은버섯', '파란버섯', '보라버섯',
    '황금버섯', '은빛버섯', '청동버섯', '철버섯', '강철버섯',
    '동굴버섯', '심해버섯', '화산버섯', '용암버섯', '얼음버섯',
    '눈꽃버섯', '수정버섯', '다이아버섯', '루비버섯', '사파이어버섯',
    '에메랄드버섯', '자수정버섯', '호박버섯', '진주버섯', '산호버섯',
    '산악버섯', '고산버섯', '평원버섯', '사막버섯', '정글버섯',
    '늪지버섯', '숲속버섯', '초원버섯', '설원버섯', '화염버섯',
    '번개버섯', '천둥버섯', '폭풍버섯', '태풍버섯', '지진버섯',
    '해일버섯', '토네이도버섯', '블리자드버섯', '유성버섯', '혜성버섯',
    '별빛버섯', '달빛버섯', '햇빛버섯', '무지개버섯', '오로라버섯',
    '심연버섯', '어둠버섯', '그림자버섯', '공허버섯', '혼돈버섯',
    '타락버섯', '저주버섯', '악마버섯', '천사버섯', '신성버섯',
    '고대버섯', '태초버섯', '원시버섯', '전설버섯', '신화버섯',
    '영웅버섯', '왕의버섯', '황제버섯', '제왕버섯', '패왕버섯',
    '용의버섯', '불사조버섯', '기린버섯', '현무버섯', '백호버섯',
    '청룡버섯', '주작버섯', '천마버섯', '신수버섯', '성수버섯',
    '거대버섯', '초거대버섯', '극대버섯', '무한버섯', '영원버섯'
];

// Get mushroom name based on chapter (changes every 25 chapters)
const getMushroomName = (chapter) => {
    const index = Math.floor((chapter - 1) / 25) % MUSHROOM_NAMES.length;
    return MUSHROOM_NAMES[index];
};

// Determine mushroom rarity and apply modifiers
// Rare: 1% chance, 3x rewards/HP, cyan color, 1.5x scale
// Epic: 0.1% chance, 10x rewards/HP, purple color, 2x scale
// Unique: 0.01% chance, 10 diamonds, 100x HP, yellow color, 3x scale
const applyMushroomRarity = (baseHp, baseReward) => {
    const roll = Math.random() * 100;

    if (roll < 0.01) {
        // Unique (0.01%)
        return {
            rarity: 'unique',
            hp: baseHp * 100,
            reward: baseReward, // Not used, gives diamonds instead
            diamondReward: 10,
            color: '#FFD700', // Gold/Yellow
            scale: 3
        };
    } else if (roll < 0.11) {
        // Epic (0.1%)
        return {
            rarity: 'epic',
            hp: baseHp * 10,
            reward: baseReward * 10,
            diamondReward: 0,
            color: '#9C27B0', // Purple
            scale: 2
        };
    } else if (roll < 1.11) {
        // Rare (1%)
        return {
            rarity: 'rare',
            hp: baseHp * 3,
            reward: baseReward * 3,
            diamondReward: 0,
            color: '#00BCD4', // Cyan
            scale: 1.5
        };
    } else {
        // Normal
        return {
            rarity: 'normal',
            hp: baseHp,
            reward: baseReward,
            diamondReward: 0,
            color: null,
            scale: 1
        };
    }
};

// Generate maps procedurally with MASSIVE HP and reward scaling
// Note: This old function is kept for compatibility but not used in stage system
const generateMaps = () => {
    const maps = {};

    for (let level = 1; level <= 1000; level++) {
        const mapKey = `map_${level}`;
        const mushrooms = [];
        const mushroomCount = 100;

        for (let i = 0; i < mushroomCount; i++) {
            const baseHp = level === 1 ? 10 : Math.floor(Math.pow(10, level * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, level * 0.04) * 50);
            const x = 30 + Math.random() * 340;
            const y = 80 + Math.random() * 380;

            let type = 'normal';
            if (level > 10 && i >= mushroomCount - 1) type = 'boss';
            else if (level > 5 && i >= mushroomCount - 2) type = 'red';

            mushrooms.push({
                id: level * 100 + i + 1,
                x: x,
                y: y,
                hp: baseHp,
                maxHp: baseHp,
                type: type,
                name: getMushroomName(level),
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
    diamond: 0, // New currency
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
    megaCriticalChance: 0, // 0% (unlocked at 100% hyper crit)
    megaCriticalDamage: 3000, // 3000% (multiplies on top of hyper crit)
    statLevels: {
        critChance: 0,
        critDamage: 0,
        hyperCritChance: 0,
        hyperCritDamage: 0,
        megaCritChance: 0,
        megaCritDamage: 0,
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
        goldBonus: { count: 0, level: 0 }
    },
    lastPullResults: null, // Array of pulled artifact IDs
    // Mushroom Collection System (400 total: 100 types × 4 rarities)
    mushroomCollection: {}, // { [mushroomName]: { normal: false, rare: false, epic: false, unique: false } }
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
            diamond: state.diamond, // Save diamond
            currentWeaponId: state.currentWeaponId,
            weaponLevel: state.weaponLevel,
            clickDamage: state.clickDamage,
            moveSpeed: state.moveSpeed,
            playerPos: state.playerPos,
            currentScene: state.currentScene,
            // mushrooms: state.mushrooms, // Don't save mushrooms to force respawn with correct count
            // Save new stats
            criticalChance: state.criticalChance,
            criticalDamage: state.criticalDamage,
            hyperCriticalChance: state.hyperCriticalChance,
            hyperCriticalDamage: state.hyperCriticalDamage,
            megaCriticalChance: state.megaCriticalChance,
            megaCriticalDamage: state.megaCriticalDamage,
            statLevels: state.statLevels,
            obtainedWeapons: state.obtainedWeapons,
            attackRange: state.attackRange,
            // Artifact System
            artifacts: state.artifacts,
            // Stage System - save currentStage and maxStage only
            currentStage: state.currentStage,
            maxStage: state.maxStage,
            // Mushroom Collection System
            mushroomCollection: state.mushroomCollection,
            // World Boss System - save maxDamage for ranking and daily attempts
            worldBoss: {
                maxDamage: state.worldBoss.maxDamage || 0,
                totalDamage: state.worldBoss.totalDamage || 0,
                dailyAttempts: state.worldBoss.dailyAttempts,
                lastResetDate: state.worldBoss.lastResetDate
            }
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
                mushrooms: [],
                // Properly merge worldBoss data with defaults
                worldBoss: {
                    ...initialState.worldBoss,
                    ...(action.payload.worldBoss || {}),
                    isActive: false, // Always start with modal closed
                    isBattling: false, // Always start not battling
                    damage: 0, // Reset current session damage
                    timeLeft: 0 // Reset timer
                }
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

        case 'ADD_DIAMOND':
            return { ...state, diamond: state.diamond + action.payload };

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
                let exponent = 1.1; // Reduced from 1.2/1.5/2.0 to 1.1 for better scaling
                if (level >= 10000) exponent = 1.2;
                else if (level >= 1000) exponent = 1.15;
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
                maxLevel = 100000;
                baseCost = 800;
                isTiered = true;
            } else if (statType === 'hyperCritChance') {
                currentLevel = state.statLevels?.hyperCritChance || 0;
                currentVal = state.hyperCriticalChance;
                maxLevel = 1000;
                baseCost = 10000000; // 10M
                isTiered = false;
            } else if (statType === 'hyperCritDamage') {
                currentLevel = state.statLevels?.hyperCritDamage || 0;
                currentVal = state.hyperCriticalDamage;
                maxLevel = 100000;
                baseCost = 100000000; // 100M
                isTiered = true;
            } else if (statType === 'megaCritChance') {
                // Unlock condition: Hyper Crit Chance >= 1000 (100%)
                if ((state.statLevels?.hyperCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.megaCritChance || 0;
                currentVal = state.megaCriticalChance;
                maxLevel = 1000;
                baseCost = 20000000000; // 20B
                isTiered = false;
            } else if (statType === 'megaCritDamage') {
                currentLevel = state.statLevels?.megaCritDamage || 0;
                currentVal = state.megaCriticalDamage;
                maxLevel = 100000;
                baseCost = 10000000000; // 10B
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
            } else if (statType === 'megaCritChance') {
                newState.megaCriticalChance = parseFloat((state.megaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.megaCritChance = currentLevel + validCount;
            } else if (statType === 'megaCritDamage') {
                newState.megaCriticalDamage = state.megaCriticalDamage + (1 * validCount);
                newState.statLevels.megaCritDamage = currentLevel + validCount;
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

            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);
            const mushroomName = getMushroomName(chapter);

            for (let i = 0; i < 100; i++) {
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system
                const rarityData = applyMushroomRarity(baseHp, baseReward);

                newMushrooms.push({
                    id: `mushroom-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    x, y,
                    hp: rarityData.hp,
                    maxHp: rarityData.hp,
                    type: 'normal',
                    name: mushroomName,
                    reward: rarityData.reward,
                    diamondReward: rarityData.diamondReward,
                    rarity: rarityData.rarity,
                    color: rarityData.color,
                    scale: rarityData.scale,
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

            // Check if this is the final stage (2500-10)
            if (chapter === 2500 && stage === 10) {
                // Final stage completed! Return to village
                return {
                    ...state,
                    currentScene: 'village',
                    mushroomsCollected: 0,
                    bossTimer: null,
                    bossPhase: false,
                    mushrooms: [],
                    diamond: state.diamond + 100 // Boss stage reward
                };
            }

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

            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);
            const mushroomName = getMushroomName(nextStage.chapter);

            for (let i = 0; i < 100; i++) {
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system
                const rarityData = applyMushroomRarity(baseHp, baseReward);

                newMushrooms.push({
                    id: `mushroom-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    x, y,
                    hp: rarityData.hp,
                    maxHp: rarityData.hp,
                    type: 'normal',
                    name: mushroomName,
                    reward: rarityData.reward,
                    diamondReward: rarityData.diamondReward,
                    rarity: rarityData.rarity,
                    color: rarityData.color,
                    scale: rarityData.scale,
                    isDead: false,
                    respawnTime: 0
                });
            }


            // Calculate diamond reward based on current stage
            // Formula: 10 for normal stages, 100 for boss stages (stage 10)
            const calculateDiamondReward = (chapter, stage) => {
                return stage === 10 ? 100 : 10;
            };

            const diamondReward = calculateDiamondReward(chapter, stage);

            return {
                ...state,
                currentStage: nextStage,
                maxStage: isNewRecord ? nextStage : state.maxStage,
                mushroomsCollected: 0,
                bossTimer: null, // No timer until boss spawns
                bossPhase: false, // Start with normal mushrooms
                mushrooms: newMushrooms,
                diamond: state.diamond + diamondReward // Add diamond reward
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

            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);
            const mushroomName = getMushroomName(chapter);

            for (let i = 0; i < 100; i++) {
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system
                const rarityData = applyMushroomRarity(baseHp, baseReward);

                newMushrooms.push({
                    id: `mushroom-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    x, y,
                    hp: rarityData.hp,
                    maxHp: rarityData.hp,
                    type: 'normal',
                    name: mushroomName,
                    reward: rarityData.reward,
                    diamondReward: rarityData.diamondReward,
                    rarity: rarityData.rarity,
                    color: rarityData.color,
                    scale: rarityData.scale,
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
            const mushroomName = getMushroomName(nextChapter);

            for (let i = 0; i < 100; i++) {
                const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
                const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system
                const rarityData = applyMushroomRarity(baseHp, baseReward);

                stageMushrooms.push({
                    id: `boss-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    x, y,
                    hp: rarityData.hp,
                    maxHp: rarityData.hp,
                    type: 'normal',
                    name: mushroomName,
                    reward: rarityData.reward,
                    diamondReward: rarityData.diamondReward,
                    rarity: rarityData.rarity,
                    color: rarityData.color,
                    scale: rarityData.scale,
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
                id: 'boss-' + Date.now(),
                x: 200, // Fixed center position
                y: 240, // Fixed center position
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

        case 'RESPAWN_MUSHROOM': {
            // Calculate current difficulty to get base stats
            // Use currentStage instead of stage, and stage property instead of level
            const difficultyLevel = (state.currentStage.chapter - 1) * 10 + state.currentStage.stage;
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.05) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.04) * 50);

            return {
                ...state,
                mushrooms: state.mushrooms.map(m => {
                    if (m.id === action.payload.id) {
                        // Don't respawn boss
                        if (m.type === 'boss') return m;

                        // Randomize position
                        const x = 30 + Math.random() * 340;
                        const y = 80 + Math.random() * 380;

                        // Apply new rarity
                        const rarityData = applyMushroomRarity(baseHp, baseReward);

                        // Generate new ID to force re-mount and avoid "moving" visual artifact
                        // This ensures the mushroom appears instantly at the new location
                        const newId = `mushroom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                        return {
                            ...m,
                            id: newId,
                            x,
                            y,
                            hp: rarityData.hp,
                            maxHp: rarityData.hp,
                            reward: rarityData.reward,
                            diamondReward: rarityData.diamondReward,
                            rarity: rarityData.rarity,
                            color: rarityData.color,
                            scale: rarityData.scale,
                            isDead: false,
                            respawnTime: 0
                        };
                    }
                    return m;
                })
            };
        }

        case 'CLEAR_RESULT_MSG':
            return { ...state, lastEnhanceResult: null, lastEvolveResult: null };

        case 'PULL_ARTIFACT': {
            const { count, cost } = action.payload;
            if (state.diamond < cost) return state;

            const newArtifacts = { ...state.artifacts };
            const pullResults = [];
            const availableTypes = ['attackBonus', 'critDamageBonus', 'goldBonus'];

            if (state.hyperCriticalChance > 0) availableTypes.push('hyperCritDamageBonus');
            if (state.megaCriticalChance > 0) availableTypes.push('megaCritDamageBonus');

            for (let i = 0; i < count; i++) {
                const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                newArtifacts[type].count += 1;
                pullResults.push(type);
            }

            return {
                ...state,
                diamond: state.diamond - cost,
                artifacts: newArtifacts,
                lastPullResults: pullResults
            };
        }

        case 'UPGRADE_ARTIFACT': {
            const { type } = action.payload;
            const artifact = state.artifacts[type];

            if (artifact.count < 1) return state;

            const successChance = Math.max(0, 100 - (artifact.level * 0.05));
            const isSuccess = Math.random() * 100 < successChance;

            return {
                ...state,
                artifacts: {
                    ...state.artifacts,
                    [type]: {
                        ...artifact,
                        count: artifact.count - 1,
                        level: isSuccess ? artifact.level + 1 : artifact.level
                    }
                }
            };
        }

        case 'CLEAR_PULL_RESULTS':
            return {
                ...state,
                lastPullResults: null
            };

        case 'COLLECT_MUSHROOM_TYPE': {
            const { name, rarity } = action.payload;
            const currentCollection = state.mushroomCollection[name] || {
                normal: false,
                rare: false,
                epic: false,
                unique: false
            };

            return {
                ...state,
                mushroomCollection: {
                    ...state.mushroomCollection,
                    [name]: {
                        ...currentCollection,
                        [rarity]: true
                    }
                }
            };
        }



        case 'SET_SCENE':
            return {
                ...state,
                currentScene: action.payload
            };

        case 'OPEN_WORLD_BOSS':
            return {
                ...state,
                worldBoss: {
                    ...state.worldBoss,
                    isActive: true
                }
            };

        case 'CLOSE_WORLD_BOSS':
            return {
                ...state,
                worldBoss: {
                    ...state.worldBoss,
                    isActive: false,
                    isBattling: false,
                    damage: 0,
                    timeLeft: 0
                }
            };

        case 'START_BOSS_BATTLE': {
            const today = new Date().toDateString();
            const needsReset = state.worldBoss.lastResetDate !== today;

            // Reset daily attempts if it's a new day
            const currentAttempts = needsReset ? 3 : state.worldBoss.dailyAttempts;

            // Check if player has attempts left
            if (currentAttempts <= 0) {
                return state; // No attempts left, don't start battle
            }

            return {
                ...state,
                currentScene: 'worldBoss',
                mushrooms: [{
                    id: 'WORLD_BOSS',
                    x: 400,
                    y: 300,
                    hp: 999999999999,
                    maxHp: 999999999999,
                    type: 'boss',
                    name: '거대 버섯 군주',
                    reward: 0,
                    isDead: false,
                    respawnTime: 0,
                    scale: 5
                }],
                worldBoss: {
                    ...state.worldBoss,
                    isBattling: true,
                    damage: 0,
                    timeLeft: 60,
                    dailyAttempts: currentAttempts - 1, // Deduct one attempt
                    lastResetDate: today // Update last reset date
                }
            };
        }

        case 'BOSS_TICK':
            return {
                ...state,
                worldBoss: {
                    ...state.worldBoss,
                    timeLeft: state.worldBoss.timeLeft - 1
                }
            };

        case 'BOSS_DAMAGE':
            return {
                ...state,
                worldBoss: {
                    ...state.worldBoss,
                    damage: state.worldBoss.damage + action.payload
                }
            };

        case 'UPDATE_MUSHROOM_POSITION':
            return {
                ...state,
                mushrooms: state.mushrooms.map(m =>
                    m.id === action.payload.id
                        ? { ...m, x: action.payload.x, y: action.payload.y }
                        : m
                )
            };

        case 'END_BOSS_BATTLE':
            // Award gold equal to 1/10 of damage dealt
            const goldReward = Math.floor(state.worldBoss.damage / 10);

            // Update max damage if current damage is higher
            const newMaxDamage = Math.max(state.worldBoss.maxDamage, state.worldBoss.damage);

            return {
                ...state,
                currentScene: 'village',
                gold: state.gold + goldReward,
                worldBoss: {
                    ...state.worldBoss,
                    isBattling: false,
                    totalDamage: state.worldBoss.totalDamage + state.worldBoss.damage,
                    maxDamage: newMaxDamage,
                    damage: 0,
                    timeLeft: 0
                }
            };

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

    // Save immediately when world boss maxDamage changes (for ranking)
    useEffect(() => {
        if (state.user && state.worldBoss.maxDamage > 0) {
            saveState(state);
        }
    }, [state.worldBoss.maxDamage]);

    // Save immediately when world boss battle ends
    const prevIsBattlingRef = React.useRef(state.worldBoss.isBattling);
    useEffect(() => {
        // Detect when battle transitions from true to false (battle ended)
        if (state.user && prevIsBattlingRef.current && !state.worldBoss.isBattling) {
            saveState(state);
        }
        prevIsBattlingRef.current = state.worldBoss.isBattling;
    }, [state.worldBoss.isBattling, state.user]);

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
                                id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
                                id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

    // Developer cheat function - expose to console
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.fnMoney = async (username, gold) => {
                try {
                    if (!username || typeof gold !== 'number') {
                        console.error('Usage: fnMoney("username", goldAmount)');
                        return false;
                    }

                    // Find user by username
                    const { data: userData, error: fetchError } = await supabase
                        .from('users')
                        .select('id, game_data')
                        .eq('username', username)
                        .single();

                    if (fetchError || !userData) {
                        console.error('User not found:', username);
                        return false;
                    }

                    const updatedGameData = {
                        ...userData.game_data,
                        gold: gold
                    };

                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ game_data: updatedGameData })
                        .eq('id', userData.id);

                    if (updateError) {
                        console.error('Failed to update gold:', updateError);
                        return false;
                    }

                    // Update local state if it's the current user
                    if (state.user?.username === username) {
                        dispatch({ type: 'LOAD_GAME_DATA', payload: updatedGameData });
                    }

                    return true;
                } catch (error) {
                    console.error('Cheat function error:', error);
                    return false;
                }
            };

            // Function to calculate total diamonds earned up to a given stage
            window.fnCalculateTotalDiamonds = (chapter, stage) => {
                let total = 0;
                for (let c = 1; c <= chapter; c++) {
                    const maxStageInChapter = (c === chapter) ? stage : 10;
                    for (let s = 1; s <= maxStageInChapter; s++) {
                        const baseReward = c * s * 10;
                        const bossBonus = s === 10 ? 100 * c : 0;
                        total += baseReward + bossBonus;
                    }
                }
                return total;
            };

            // Function to give all users diamonds based on their current stage
            window.fnGiveDiamonds = async () => {
                try {
                    console.log('🎁 Starting diamond distribution to all users...');

                    // Fetch all users
                    const { data: users, error: fetchError } = await supabase
                        .from('users')
                        .select('id, username, game_data');

                    if (fetchError) {
                        console.error('Failed to fetch users:', fetchError);
                        return false;
                    }

                    let successCount = 0;
                    let failCount = 0;

                    for (const user of users) {
                        try {
                            const currentStage = user.game_data?.currentStage || { chapter: 1, stage: 1 };
                            const { chapter, stage } = currentStage;

                            // Calculate total diamonds for this user's progress
                            const totalDiamonds = window.fnCalculateTotalDiamonds(chapter, stage);

                            const updatedGameData = {
                                ...user.game_data,
                                diamond: (user.game_data?.diamond || 0) + totalDiamonds
                            };

                            const { error: updateError } = await supabase
                                .from('users')
                                .update({ game_data: updatedGameData })
                                .eq('id', user.id);

                            if (updateError) {
                                console.error(`Failed to update ${user.username}:`, updateError);
                                failCount++;
                            } else {
                                console.log(`✅ ${user.username} (${chapter}-${stage}): +${totalDiamonds} 💎`);
                                successCount++;

                                // Update local state if it's the current user
                                if (state.user?.username === user.username) {
                                    dispatch({ type: 'LOAD_GAME_DATA', payload: updatedGameData });
                                }
                            }
                        } catch (err) {
                            console.error(`Error processing ${user.username}:`, err);
                            failCount++;
                        }
                    }

                    console.log(`\n🎉 Diamond distribution complete!`);
                    console.log(`✅ Success: ${successCount} users`);
                    console.log(`❌ Failed: ${failCount} users`);

                    return true;
                } catch (error) {
                    console.error('Diamond distribution error:', error);
                    return false;
                }
            };

        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.fnMoney;
            }
        };
    }, [state.user]);

    // Fetch World Boss Rankings
    const fetchWorldBossRankings = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('username, game_data');

            if (error) throw error;

            const rankings = data
                .map(user => ({
                    username: user.username,
                    damage: user.game_data?.worldBoss?.maxDamage || 0
                }))
                .filter(user => user.damage > 0)
                .sort((a, b) => b.damage - a.damage)
                .slice(0, 10);

            return rankings;
        } catch (error) {
            console.error('Failed to fetch world boss rankings:', error);
            return [];
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
            fetchWorldBossRankings,
            resetGame,
            sendChatMessage,
            sendChatMessage,
            setChatOpen,
            isLoading: state.isLoading
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
