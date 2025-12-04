import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WEAPONS } from '../data/weapons';
import { getMushroomName } from '../data/mushrooms';
import { initialState, SAVE_KEY } from '../data/constants';

const GameContext = createContext();

// Helper function to get Eagle pet rare mushroom multiplier
const getPetRarityMultiplier = (equippedPets) => {
    if (!equippedPets || equippedPets.length === 0) return 1;

    const rarityMultipliers = { common: 1.1, rare: 1.3, epic: 1.6, legendary: 2, mythic: 3 };
    let multiplier = 1;

    equippedPets.forEach(petId => {
        const [type, rarity] = petId.split('_');
        if (type === 'eagle' && rarityMultipliers[rarity]) {
            multiplier = Math.max(multiplier, rarityMultipliers[rarity]);
        }
    });

    return multiplier;
};

// Determine mushroom rarity and apply modifiers
// Rare: 1% chance, 3x rewards/HP, cyan color, 1.5x scale
// Epic: 0.1% chance, 10x rewards/HP, purple color, 2x scale
// Unique: 0.01% chance, 10 diamonds, 100x HP, yellow color, 3x scale
const applyMushroomRarity = (baseHp, baseReward, rarityMultiplier = 1) => {
    const roll = Math.random() * 100;

    // Apply Eagle pet multiplier to rare mushroom rates
    const uniqueRate = 0.01 * rarityMultiplier;
    const epicRate = 0.1 * rarityMultiplier;
    const rareRate = 1 * rarityMultiplier;

    if (roll < uniqueRate) {
        // Unique
        return {
            rarity: 'unique',
            hp: baseHp * 100,
            reward: baseReward,
            diamondReward: 20,
            color: '#FFD700',
            scale: 3
        };
    } else if (roll < uniqueRate + epicRate) {
        // Epic
        return {
            rarity: 'epic',
            hp: baseHp * 10,
            reward: baseReward * 10,
            diamondReward: 0,
            color: '#9C27B0',
            scale: 2
        };
    } else if (roll < uniqueRate + epicRate + rareRate) {
        // Rare
        return {
            rarity: 'rare',
            hp: baseHp * 3,
            reward: baseReward * 3,
            diamondReward: 0,
            color: '#00BCD4',
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

// LocalStorage key is now imported from constants

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
            // Collection Rewards System
            claimedRewards: state.claimedRewards,
            // World Boss System - save maxDamage for ranking and daily attempts
            worldBoss: {
                maxDamage: state.worldBoss.maxDamage || 0,
                totalDamage: state.worldBoss.totalDamage || 0,
                dailyAttempts: state.worldBoss.dailyAttempts,
                lastResetDate: state.worldBoss.lastResetDate
            },
            // Infinity Crit
            infinityCriticalChance: state.infinityCriticalChance,
            infinityCriticalDamage: state.infinityCriticalDamage,
            // Pet System
            pets: state.pets
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
    if (!weapon) return 0;

    // Ensure minimum +1 damage per level, matching upgradeBonus logic
    const damagePerLevel = Math.max(1, weapon.upgradeBonus);
    const damage = weapon.baseDamage + (damagePerLevel * level);
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

        case 'LOAD_GAME_DATA': {
            const loadedState = {
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

            // Critical Tier Migration & Recalculation
            const criticalTiers = [
                { name: 'giga', base: 300 },
                { name: 'tera', base: 350 },
                { name: 'peta', base: 400 },
                { name: 'exa', base: 450 },
                { name: 'zetta', base: 500 },
                { name: 'yotta', base: 550 },
                { name: 'ronna', base: 600 },
                { name: 'quetta', base: 650 },
                { name: 'xeno', base: 700 },
                { name: 'ultima', base: 800 },
                { name: 'omni', base: 900 },
                { name: 'absolute', base: 1000 },
                { name: 'infinity', base: 1500 }
            ];

            // Ensure statLevels exists
            if (!loadedState.statLevels) loadedState.statLevels = {};

            // 1. Fix Mega Critical Base (was 3000, now 250)
            const megaLevel = loadedState.statLevels.megaCritDamage || 0;
            loadedState.megaCriticalDamage = 250 + megaLevel;

            // 2. Fix Hyper Critical Base (was 200, unchanged but good to enforce)
            const hyperLevel = loadedState.statLevels.hyperCritDamage || 0;
            loadedState.hyperCriticalDamage = 200 + hyperLevel;

            // 3. Initialize & Fix New Tiers
            criticalTiers.forEach(tier => {
                const chanceKey = `${tier.name}CriticalChance`;
                const damageKey = `${tier.name}CriticalDamage`;
                const chanceLevelKey = `${tier.name}CritChance`;
                const damageLevelKey = `${tier.name}CritDamage`;

                // Initialize if missing
                if (typeof loadedState[chanceKey] === 'undefined') loadedState[chanceKey] = 0;
                if (typeof loadedState.statLevels[chanceLevelKey] === 'undefined') loadedState.statLevels[chanceLevelKey] = 0;

                if (typeof loadedState.statLevels[damageLevelKey] === 'undefined') loadedState.statLevels[damageLevelKey] = 0;

                // Recalculate Damage Value based on New Base + Level
                const currentLevel = loadedState.statLevels[damageLevelKey];
                loadedState[damageKey] = tier.base + currentLevel;
            });

            // Recalculate stats based on levels (to apply new formulas to old saves)
            if (loadedState.statLevels) {
                const moveSpeedLevel = loadedState.statLevels.moveSpeed || 0;
                const attackRangeLevel = loadedState.statLevels.attackRange || 0;

                // New Formula: 5 + (5 * level / 300) -> Max 10 (was 15)
                loadedState.moveSpeed = 5 + (5 * moveSpeedLevel / 300);

                // New Formula: 80 + (40 * level / 300) -> Max 120 (was 160)
                loadedState.attackRange = 80 + (40 * attackRangeLevel / 300);
            }

            // Recalculate weapon damage based on new formula
            if (typeof loadedState.currentWeaponId !== 'undefined') {
                loadedState.clickDamage = calculateDamage(loadedState.currentWeaponId, loadedState.weaponLevel || 0);
            }

            // Artifact Migration
            if (loadedState.artifacts) {
                // Remove deprecated artifacts
                delete loadedState.artifacts.hyperCritDamageBonus;
                delete loadedState.artifacts.megaCritDamageBonus;

                // Initialize new artifacts if missing
                if (!loadedState.artifacts.moveSpeed) loadedState.artifacts.moveSpeed = { count: 0, level: 0 };
                if (!loadedState.artifacts.attackRange) loadedState.artifacts.attackRange = { count: 0, level: 0 };

                // Remove attackSpeed artifact if it exists
                delete loadedState.artifacts.attackSpeed;
            }

            // Pet Migration
            if (!loadedState.pets) {
                loadedState.pets = {
                    inventory: {},
                    equipped: [],
                    unlockedSlots: 3
                };
            } else {
                // Ensure at least 3 slots for existing users
                if (!loadedState.pets.unlockedSlots || loadedState.pets.unlockedSlots < 3) {
                    loadedState.pets.unlockedSlots = 3;
                }
            }

            // Skin Migration
            if (!loadedState.skins) {
                loadedState.skins = {
                    inventory: {},
                    equipped: null,
                    unlocked: []
                };
            } else if (!loadedState.skins.unlocked) {
                loadedState.skins.unlocked = [];
            }

            return loadedState;
        }

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
                // Use helper function for consistent damage calculation
                const newDamage = calculateDamage(state.currentWeaponId, newLevel);

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
                // Level^3 scaling for critical damage to allow max level before next tier
                return Math.floor(baseCost * Math.pow(level + 1, 3));
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
                baseCost = 1; // 1/1000 of Normal Chance Cost (1000)
                isTiered = true;
            } else if (statType === 'hyperCritChance') {
                currentLevel = state.statLevels?.hyperCritChance || 0;
                currentVal = state.hyperCriticalChance;
                maxLevel = 1000;
                baseCost = 1e15; // 1,000C (Weapon 25)
                isTiered = false;
            } else if (statType === 'hyperCritDamage') {
                currentLevel = state.statLevels?.hyperCritDamage || 0;
                currentVal = state.hyperCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e12; // 1C (1/1000 of Hyper Chance)
                isTiered = true;
            } else if (statType === 'megaCritChance') {
                // Unlock condition: Hyper Crit Chance >= 1000 (100%)
                if ((state.statLevels?.hyperCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.megaCritChance || 0;
                currentVal = state.megaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e30; // 100G (Weapon 50)
                isTiered = false;
            } else if (statType === 'megaCritDamage') {
                currentLevel = state.statLevels?.megaCritDamage || 0;
                currentVal = state.megaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e27; // 100F (1/1000 of Mega Chance)
                isTiered = true;
            } else if (statType === 'gigaCritChance') {
                // Unlock condition: Mega Crit Chance >= 1000
                if ((state.statLevels?.megaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.gigaCritChance || 0;
                currentVal = state.gigaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e45; // 10K (Weapon 75)
                isTiered = false;
            } else if (statType === 'gigaCritDamage') {
                currentLevel = state.statLevels?.gigaCritDamage || 0;
                currentVal = state.gigaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e42; // 1,000J (1/1000 of Giga Chance)
                isTiered = true;
            } else if (statType === 'teraCritChance') {
                // Unlock condition: Giga Crit Chance >= 1000
                if ((state.statLevels?.gigaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.teraCritChance || 0;
                currentVal = state.teraCriticalChance;
                maxLevel = 1000;
                baseCost = 1e60; // 1O (Weapon 100)
                isTiered = false;
            } else if (statType === 'teraCritDamage') {
                currentLevel = state.statLevels?.teraCritDamage || 0;
                currentVal = state.teraCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e57; // 100N (1/1000 of Tera Chance)
                isTiered = true;
            } else if (statType === 'petaCritChance') {
                // Unlock condition: Tera Crit Chance >= 1000
                if ((state.statLevels?.teraCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.petaCritChance || 0;
                currentVal = state.petaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e75; // 1,000R (Weapon 125)
                isTiered = false;
            } else if (statType === 'petaCritDamage') {
                currentLevel = state.statLevels?.petaCritDamage || 0;
                currentVal = state.petaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e72; // 10R (1/1000 of Peta Chance)
                isTiered = true;
            } else if (statType === 'exaCritChance') {
                // Unlock condition: Peta Crit Chance >= 1000
                if ((state.statLevels?.petaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.exaCritChance || 0;
                currentVal = state.exaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e90; // 100V (Weapon 150)
                isTiered = false;
            } else if (statType === 'exaCritDamage') {
                currentLevel = state.statLevels?.exaCritDamage || 0;
                currentVal = state.exaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e87; // 1V (1/1000 of Exa Chance)
                isTiered = true;
            } else if (statType === 'zettaCritChance') {
                // Unlock condition: Exa Crit Chance >= 1000
                if ((state.statLevels?.exaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.zettaCritChance || 0;
                currentVal = state.zettaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e105; // 10Z (Weapon 175)
                isTiered = false;
            } else if (statType === 'zettaCritDamage') {
                currentLevel = state.statLevels?.zettaCritDamage || 0;
                currentVal = state.zettaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e102; // 1,000Y (1/1000 of Zetta Chance)
                isTiered = true;
            } else if (statType === 'yottaCritChance') {
                // Unlock condition: Zetta Crit Chance >= 1000
                if ((state.statLevels?.zettaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.yottaCritChance || 0;
                currentVal = state.yottaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e120; // 1AD (Weapon 200)
                isTiered = false;
            } else if (statType === 'yottaCritDamage') {
                currentLevel = state.statLevels?.yottaCritDamage || 0;
                currentVal = state.yottaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e117; // 100AC (1/1000 of Yotta Chance)
                isTiered = true;
            } else if (statType === 'ronnaCritChance') {
                // Unlock condition: Yotta Crit Chance >= 1000
                if ((state.statLevels?.yottaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.ronnaCritChance || 0;
                currentVal = state.ronnaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e135; // 1,000AG (Weapon 225)
                isTiered = false;
            } else if (statType === 'ronnaCritDamage') {
                currentLevel = state.statLevels?.ronnaCritDamage || 0;
                currentVal = state.ronnaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e132; // 10AG (1/1000 of Ronna Chance)
                isTiered = true;
            } else if (statType === 'quettaCritChance') {
                // Unlock condition: Ronna Crit Chance >= 1000
                if ((state.statLevels?.ronnaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.quettaCritChance || 0;
                currentVal = state.quettaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e150; // 100AK (Weapon 250)
                isTiered = false;
            } else if (statType === 'quettaCritDamage') {
                currentLevel = state.statLevels?.quettaCritDamage || 0;
                currentVal = state.quettaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e147; // 1AK (1/1000 of Quetta Chance)
                isTiered = true;
            } else if (statType === 'xenoCritChance') {
                // Unlock condition: Quetta Crit Chance >= 1000
                if ((state.statLevels?.quettaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.xenoCritChance || 0;
                currentVal = state.xenoCriticalChance;
                maxLevel = 1000;
                baseCost = 1e165; // 10AO (Weapon 275)
                isTiered = false;
            } else if (statType === 'xenoCritDamage') {
                currentLevel = state.statLevels?.xenoCritDamage || 0;
                currentVal = state.xenoCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e162; // 1,000AN (1/1000 of Xeno Chance)
                isTiered = true;
            } else if (statType === 'ultimaCritChance') {
                // Unlock condition: Xeno Crit Chance >= 1000
                if ((state.statLevels?.xenoCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.ultimaCritChance || 0;
                currentVal = state.ultimaCriticalChance;
                maxLevel = 1000;
                baseCost = 1e180; // 1AS (Weapon 300)
                isTiered = false;
            } else if (statType === 'ultimaCritDamage') {
                currentLevel = state.statLevels?.ultimaCritDamage || 0;
                currentVal = state.ultimaCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e177; // 100AQ (1/1000 of Ultima Chance)
                isTiered = true;
            } else if (statType === 'omniCritChance') {
                // Unlock condition: Ultima Crit Chance >= 1000
                if ((state.statLevels?.ultimaCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.omniCritChance || 0;
                currentVal = state.omniCriticalChance;
                maxLevel = 1000;
                baseCost = 1e195; // 1,000AV (Weapon 325)
                isTiered = false;
            } else if (statType === 'omniCritDamage') {
                currentLevel = state.statLevels?.omniCritDamage || 0;
                currentVal = state.omniCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e192; // 10AV (1/1000 of Omni Chance)
                isTiered = true;
            } else if (statType === 'absoluteCritChance') {
                // Unlock condition: Omni Crit Chance >= 1000
                if ((state.statLevels?.omniCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.absoluteCritChance || 0;
                currentVal = state.absoluteCriticalChance;
                maxLevel = 1000;
                baseCost = 1e210; // 100AZ (Weapon 350)
                isTiered = false;
            } else if (statType === 'absoluteCritDamage') {
                currentLevel = state.statLevels?.absoluteCritDamage || 0;
                currentVal = state.absoluteCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e207; // 1AZ (1/1000 of Absolute Chance)
                isTiered = true;

            } else if (statType === 'infinityCritChance') {
                // Unlock condition: Absolute Crit Chance >= 1000
                if ((state.statLevels?.absoluteCritChance || 0) < 1000) return state;

                currentLevel = state.statLevels?.infinityCritChance || 0;
                currentVal = state.infinityCriticalChance;
                maxLevel = 1000;
                baseCost = 1e225; // 10BD (Weapon 375)
                isTiered = false;
            } else if (statType === 'infinityCritDamage') {
                currentLevel = state.statLevels?.infinityCritDamage || 0;
                currentVal = state.infinityCriticalDamage;
                maxLevel = 100000;
                baseCost = 1e222; // 1,000BC (1/1000 of Infinity Chance)
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
            } else if (statType === 'gigaCritChance') {
                newState.gigaCriticalChance = parseFloat((state.gigaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.gigaCritChance = currentLevel + validCount;
            } else if (statType === 'gigaCritDamage') {
                newState.gigaCriticalDamage = state.gigaCriticalDamage + (1 * validCount);
                newState.statLevels.gigaCritDamage = currentLevel + validCount;
            } else if (statType === 'teraCritChance') {
                newState.teraCriticalChance = parseFloat((state.teraCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.teraCritChance = currentLevel + validCount;
            } else if (statType === 'teraCritDamage') {
                newState.teraCriticalDamage = state.teraCriticalDamage + (1 * validCount);
                newState.statLevels.teraCritDamage = currentLevel + validCount;
            } else if (statType === 'petaCritChance') {
                newState.petaCriticalChance = parseFloat((state.petaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.petaCritChance = currentLevel + validCount;
            } else if (statType === 'petaCritDamage') {
                newState.petaCriticalDamage = state.petaCriticalDamage + (1 * validCount);
                newState.statLevels.petaCritDamage = currentLevel + validCount;
            } else if (statType === 'exaCritChance') {
                newState.exaCriticalChance = parseFloat((state.exaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.exaCritChance = currentLevel + validCount;
            } else if (statType === 'exaCritDamage') {
                newState.exaCriticalDamage = state.exaCriticalDamage + (1 * validCount);
                newState.statLevels.exaCritDamage = currentLevel + validCount;
            } else if (statType === 'zettaCritChance') {
                newState.zettaCriticalChance = parseFloat((state.zettaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.zettaCritChance = currentLevel + validCount;
            } else if (statType === 'zettaCritDamage') {
                newState.zettaCriticalDamage = state.zettaCriticalDamage + (1 * validCount);
                newState.statLevels.zettaCritDamage = currentLevel + validCount;
            } else if (statType === 'yottaCritChance') {
                newState.yottaCriticalChance = parseFloat((state.yottaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.yottaCritChance = currentLevel + validCount;
            } else if (statType === 'yottaCritDamage') {
                newState.yottaCriticalDamage = state.yottaCriticalDamage + (1 * validCount);
                newState.statLevels.yottaCritDamage = currentLevel + validCount;
            } else if (statType === 'ronnaCritChance') {
                newState.ronnaCriticalChance = parseFloat((state.ronnaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.ronnaCritChance = currentLevel + validCount;
            } else if (statType === 'ronnaCritDamage') {
                newState.ronnaCriticalDamage = state.ronnaCriticalDamage + (1 * validCount);
                newState.statLevels.ronnaCritDamage = currentLevel + validCount;
            } else if (statType === 'quettaCritChance') {
                newState.quettaCriticalChance = parseFloat((state.quettaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.quettaCritChance = currentLevel + validCount;
            } else if (statType === 'quettaCritDamage') {
                newState.quettaCriticalDamage = state.quettaCriticalDamage + (1 * validCount);
                newState.statLevels.quettaCritDamage = currentLevel + validCount;
            } else if (statType === 'xenoCritChance') {
                newState.xenoCriticalChance = parseFloat((state.xenoCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.xenoCritChance = currentLevel + validCount;
            } else if (statType === 'xenoCritDamage') {
                newState.xenoCriticalDamage = state.xenoCriticalDamage + (1 * validCount);
                newState.statLevels.xenoCritDamage = currentLevel + validCount;
            } else if (statType === 'ultimaCritChance') {
                newState.ultimaCriticalChance = parseFloat((state.ultimaCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.ultimaCritChance = currentLevel + validCount;
            } else if (statType === 'ultimaCritDamage') {
                newState.ultimaCriticalDamage = state.ultimaCriticalDamage + (1 * validCount);
                newState.statLevels.ultimaCritDamage = currentLevel + validCount;
            } else if (statType === 'omniCritChance') {
                newState.omniCriticalChance = parseFloat((state.omniCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.omniCritChance = currentLevel + validCount;
            } else if (statType === 'omniCritDamage') {
                newState.omniCriticalDamage = state.omniCriticalDamage + (1 * validCount);
                newState.statLevels.omniCritDamage = currentLevel + validCount;
            } else if (statType === 'absoluteCritChance') {
                newState.absoluteCriticalChance = parseFloat((state.absoluteCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.absoluteCritChance = currentLevel + validCount;
            } else if (statType === 'absoluteCritDamage') {
                newState.absoluteCriticalDamage = state.absoluteCriticalDamage + (1 * validCount);
                newState.statLevels.absoluteCritDamage = currentLevel + validCount;
            } else if (statType === 'infinityCritChance') {
                newState.infinityCriticalChance = parseFloat((state.infinityCriticalChance + (0.1 * validCount)).toFixed(1));
                newState.statLevels.infinityCritChance = currentLevel + validCount;
            } else if (statType === 'infinityCritDamage') {
                newState.infinityCriticalDamage = state.infinityCriticalDamage + (1 * validCount);
                newState.statLevels.infinityCritDamage = currentLevel + validCount;
            } else if (statType === 'moveSpeed') {
                // Formula: 5 + (5 * level / 300) - Reduced effect by half
                const newLevel = currentLevel + validCount;
                newState.moveSpeed = 5 + (5 * newLevel / 300);
                newState.statLevels.moveSpeed = newLevel;
            } else if (statType === 'attackRange') {
                // Formula: 80 + (40 * level / 300) - Reduced effect by half
                const newLevel = currentLevel + validCount;
                newState.attackRange = 80 + (40 * newLevel / 300);
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

            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.055) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.035) * 50);
            const mushroomName = getMushroomName(nextStage.chapter);

            for (let i = 0; i < 100; i++) {
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system with Eagle pet multiplier
                const rarityMultiplier = getPetRarityMultiplier(state.pets?.equipped || []);
                const rarityData = applyMushroomRarity(baseHp, baseReward, rarityMultiplier);

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



        case 'SELECT_STAGE': {
            const { chapter, stage } = action.payload;
            const difficultyLevel = (chapter - 1) * 10 + stage;
            let newMushrooms = [];

            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.055) * 100);
            const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.035) * 50);
            const mushroomName = getMushroomName(chapter);

            for (let i = 0; i < 100; i++) {
                const x = 30 + Math.random() * 340;
                const y = 80 + Math.random() * 380;

                // Apply rarity system with Eagle pet multiplier
                const rarityMultiplier = getPetRarityMultiplier(state.pets?.equipped || []);
                const rarityData = applyMushroomRarity(baseHp, baseReward, rarityMultiplier);

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
                const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.055) * 100);
                const baseReward = Math.floor(Math.pow(10, difficultyLevel * 0.035) * 50);
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
            const baseHp = Math.floor(Math.pow(10, difficultyLevel * 0.055) * 100);
            const bossHp = baseHp * 1000; // 1000x HP
            const bossReward = Math.floor(Math.pow(10, difficultyLevel * 0.035) * 50) * 100; // 100x Reward

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

                        // Apply new rarity with Eagle pet multiplier
                        const rarityMultiplier = getPetRarityMultiplier(state.pets?.equipped || []);
                        const rarityData = applyMushroomRarity(baseHp, baseReward, rarityMultiplier);

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
            const availableTypes = [
                'attackBonus',
                'critDamageBonus',
                'goldBonus',
                'moveSpeed',
                'attackRange'
            ];

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

            // Validation: must have count and not exceed max level
            if (artifact.count < 1 || artifact.level >= 1000) return state;

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

        case 'SELL_ARTIFACT': {
            const { type, count } = action.payload;
            const artifact = state.artifacts[type];

            // Validation: artifact must be level 1000+ and have enough count
            if (!artifact || artifact.level < 1000 || artifact.count < count || count <= 0) {
                return state;
            }

            const diamondGain = count * 100; // 100 diamond per artifact (same as pull price)

            return {
                ...state,
                diamond: state.diamond + diamondGain,
                artifacts: {
                    ...state.artifacts,
                    [type]: {
                        ...artifact,
                        count: artifact.count - count
                    }
                }
            };
        }

        case 'CLEAR_PULL_RESULTS':
            return {
                ...state,
                lastPullResults: null
            };

        case 'PULL_PET': {
            const { count, cost } = action.payload;
            if (state.diamond < cost) return state;

            const newInventory = { ...state.pets.inventory };
            const pullResults = [];
            const petTypes = ['slime', 'wolf', 'eagle', 'dragon', 'fairy'];

            // Rates: 83.9, 10, 5, 1, 0.1
            const getRarity = () => {
                const rand = Math.random() * 100;
                if (rand < 0.1) return 'mythic';
                if (rand < 1.1) return 'legendary';
                if (rand < 6.1) return 'epic';
                if (rand < 16.1) return 'rare';
                return 'common';
            };

            for (let i = 0; i < count; i++) {
                const type = petTypes[Math.floor(Math.random() * petTypes.length)];
                const rarity = getRarity();
                const petId = `${type}_${rarity}`;

                newInventory[petId] = (newInventory[petId] || 0) + 1;
                pullResults.push(petId);
            }

            return {
                ...state,
                diamond: state.diamond - cost,
                pets: {
                    ...state.pets,
                    inventory: newInventory
                },
                lastPullResults: pullResults
            };
        }

        case 'MERGE_PET': {
            const { petId } = action.payload;
            const [type, rarity] = petId.split('_');
            const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
            const rarityIndex = rarities.indexOf(rarity);

            if (rarityIndex === -1 || rarityIndex === rarities.length - 1) return state;

            const currentCount = state.pets.inventory[petId] || 0;
            if (currentCount < 5) return state;

            const nextRarity = rarities[rarityIndex + 1];
            const nextPetId = `${type}_${nextRarity}`;

            return {
                ...state,
                pets: {
                    ...state.pets,
                    inventory: {
                        ...state.pets.inventory,
                        [petId]: currentCount - 5,
                        [nextPetId]: (state.pets.inventory[nextPetId] || 0) + 1
                    }
                }
            };
        }

        case 'EQUIP_PET': {
            const { petId } = action.payload;
            if (state.pets.equipped.includes(petId)) return state;
            if (state.pets.equipped.length >= state.pets.unlockedSlots) return state;
            if ((state.pets.inventory[petId] || 0) < 1) return state;

            return {
                ...state,
                pets: {
                    ...state.pets,
                    equipped: [...state.pets.equipped, petId]
                }
            };
        }

        case 'UNEQUIP_PET': {
            const { petId } = action.payload;
            return {
                ...state,
                pets: {
                    ...state.pets,
                    equipped: state.pets.equipped.filter(id => id !== petId)
                }
            };
        }

        case 'PULL_SKIN': {
            const { count, cost } = action.payload;
            if (state.diamond < cost) return state;

            const newInventory = { ...state.skins.inventory };
            const newUnlocked = [...(state.skins.unlocked || [])];
            const pullResults = [];

            // Rarity rates: 83.9, 10, 5, 1, 0.1
            const getRarity = () => {
                const rand = Math.random() * 100;
                if (rand < 0.1) return 'mythic';
                if (rand < 1.1) return 'legendary';
                if (rand < 6.1) return 'epic';
                if (rand < 16.1) return 'rare';
                return 'common';
            };

            // Grade rates: 40, 30, 20, 10
            const getGrade = () => {
                const rand = Math.random() * 100;
                if (rand < 10) return 1;
                if (rand < 30) return 2;
                if (rand < 60) return 3;
                return 4;
            };

            for (let i = 0; i < count; i++) {
                const rarity = getRarity();
                const grade = getGrade();
                const skinId = `skin_${rarity}_${grade}`;

                newInventory[skinId] = (newInventory[skinId] || 0) + 1;
                pullResults.push(skinId);

                // Add to unlocked if not already there
                if (!newUnlocked.includes(skinId)) {
                    newUnlocked.push(skinId);
                }
            }

            return {
                ...state,
                diamond: state.diamond - cost,
                skins: {
                    ...state.skins,
                    inventory: newInventory,
                    unlocked: newUnlocked
                },
                lastPullResults: pullResults
            };
        }

        case 'MERGE_SKIN': {
            const { skinId } = action.payload;
            const parts = skinId.split('_');
            if (parts.length !== 3) return state;

            const rarity = parts[1];
            const grade = parseInt(parts[2]);

            const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
            const rarityIndex = rarities.indexOf(rarity);

            if (rarityIndex === -1) return state;
            if (rarity === 'mythic' && grade === 1) return state;

            const currentCount = state.skins.inventory[skinId] || 0;
            if (currentCount < 5) return state;

            let nextRarity = rarity;
            let nextGrade = grade - 1;

            if (nextGrade < 1) {
                if (rarityIndex >= rarities.length - 1) return state;
                nextRarity = rarities[rarityIndex + 1];
                nextGrade = 4;
            }

            const nextSkinId = `skin_${nextRarity}_${nextGrade}`;

            return {
                ...state,
                skins: {
                    ...state.skins,
                    inventory: {
                        ...state.skins.inventory,
                        [skinId]: currentCount - 5,
                        [nextSkinId]: (state.skins.inventory[nextSkinId] || 0) + 1
                    }
                }
            };
        }

        case 'MERGE_ALL_SKINS': {
            let newInventory = { ...state.skins.inventory };
            let mergedAny = false;

            const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];

            // Iterate multiple times to handle cascading merges
            for (let iteration = 0; iteration < 20; iteration++) {
                let mergedThisRound = false;

                Object.keys(newInventory).forEach(skinId => {
                    const parts = skinId.split('_');
                    if (parts.length !== 3) return;

                    const rarity = parts[1];
                    const grade = parseInt(parts[2]);
                    const rarityIndex = rarities.indexOf(rarity);

                    if (rarityIndex === -1) return;
                    if (rarity === 'mythic' && grade === 1) return;

                    const currentCount = newInventory[skinId] || 0;
                    if (currentCount < 5) return;

                    const mergeCount = Math.floor(currentCount / 5);
                    if (mergeCount === 0) return;

                    let nextRarity = rarity;
                    let nextGrade = grade - 1;

                    if (nextGrade < 1) {
                        if (rarityIndex >= rarities.length - 1) return;
                        nextRarity = rarities[rarityIndex + 1];
                        nextGrade = 4;
                    }

                    const nextSkinId = `skin_${nextRarity}_${nextGrade}`;

                    newInventory[skinId] = currentCount - (mergeCount * 5);
                    newInventory[nextSkinId] = (newInventory[nextSkinId] || 0) + mergeCount;
                    mergedThisRound = true;
                    mergedAny = true;
                });

                if (!mergedThisRound) break;
            }

            if (!mergedAny) return state;

            return {
                ...state,
                skins: {
                    ...state.skins,
                    inventory: newInventory
                }
            };
        }

        case 'EQUIP_SKIN': {
            const { skinId } = action.payload;
            if (state.skins.equipped === skinId) return state;
            if ((state.skins.inventory[skinId] || 0) < 1) return state;

            return {
                ...state,
                skins: {
                    ...state.skins,
                    equipped: skinId
                }
            };
        }

        case 'UNEQUIP_SKIN': {
            return {
                ...state,
                skins: {
                    ...state.skins,
                    equipped: null
                }
            };
        }

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

        case 'CLAIM_WEAPON_REWARD': {
            const { weaponId } = action.payload;

            // Check if already claimed
            if (state.claimedRewards.weapons.includes(weaponId)) {
                return state;
            }

            // Check if weapon is obtained
            if (!state.obtainedWeapons.includes(weaponId)) {
                return state;
            }

            return {
                ...state,
                diamond: state.diamond + 200,
                claimedRewards: {
                    ...state.claimedRewards,
                    weapons: [...state.claimedRewards.weapons, weaponId]
                }
            };
        }

        case 'CLAIM_MUSHROOM_REWARD': {
            const { name, rarity } = action.payload;

            // Check if mushroom rarity is collected
            if (!state.mushroomCollection[name] || !state.mushroomCollection[name][rarity]) {
                return state;
            }

            // Check if already claimed
            const currentClaimed = state.claimedRewards.mushrooms[name] || {
                normal: false,
                rare: false,
                epic: false,
                unique: false
            };

            if (currentClaimed[rarity]) {
                return state;
            }

            // Determine diamond reward based on rarity
            const rewardAmounts = {
                normal: 20,
                rare: 50,
                epic: 100,
                unique: 200
            };

            return {
                ...state,
                diamond: state.diamond + rewardAmounts[rarity],
                claimedRewards: {
                    ...state.claimedRewards,
                    mushrooms: {
                        ...state.claimedRewards.mushrooms,
                        [name]: {
                            ...currentClaimed,
                            [rarity]: true
                        }
                    }
                }
            };
        }

        case 'CLAIM_PET_REWARD': {
            const { petId } = action.payload;

            // Check if already claimed
            if (state.claimedRewards.pets.includes(petId)) {
                return state;
            }

            // Check if pet is collected (in inventory)
            if (!state.pets.inventory[petId]) {
                return state;
            }

            return {
                ...state,
                diamond: state.diamond + 500, // 500 Diamonds per pet
                claimedRewards: {
                    ...state.claimedRewards,
                    pets: [...state.claimedRewards.pets, petId]
                }
            };
        }

        case 'CLAIM_ALL_REWARDS': {
            let totalDiamonds = 0;
            const newClaimedWeapons = [...state.claimedRewards.weapons];
            const newClaimedMushrooms = { ...state.claimedRewards.mushrooms };
            const newClaimedPets = [...(state.claimedRewards.pets || [])];

            // Claim all weapon rewards
            state.obtainedWeapons.forEach(weaponId => {
                if (!newClaimedWeapons.includes(weaponId)) {
                    totalDiamonds += 200;
                    newClaimedWeapons.push(weaponId);
                }
            });

            // Claim all mushroom rewards
            const rewardAmounts = {
                normal: 20,
                rare: 50,
                epic: 100,
                unique: 200
            };

            Object.entries(state.mushroomCollection).forEach(([name, rarities]) => {
                const currentClaimed = newClaimedMushrooms[name] || {
                    normal: false,
                    rare: false,
                    epic: false,
                    unique: false
                };

                ['normal', 'rare', 'epic', 'unique'].forEach(rarity => {
                    if (rarities[rarity] && !currentClaimed[rarity]) {
                        totalDiamonds += rewardAmounts[rarity];
                        currentClaimed[rarity] = true;
                    }
                });

                newClaimedMushrooms[name] = currentClaimed;
            });

            // Claim all pet rewards (NEW)
            const petTypes = ['slime', 'wolf', 'eagle', 'dragon', 'fairy'];
            const petRarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];

            petTypes.forEach(type => {
                petRarities.forEach(rarity => {
                    const petId = `${type}_${rarity}`;
                    // Check if collected (in inventory) and not claimed
                    if (state.pets.inventory[petId] && !newClaimedPets.includes(petId)) {
                        newClaimedPets.push(petId);
                        totalDiamonds += 500;
                    }
                });
            });

            if (totalDiamonds === 0) {
                return state;
            }

            return {
                ...state,
                diamond: state.diamond + totalDiamonds,
                claimedRewards: {
                    weapons: newClaimedWeapons,
                    mushrooms: newClaimedMushrooms
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
            // Award gold equal to 1/10000 of damage dealt
            const goldReward = Math.floor(state.worldBoss.damage / 10000);

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

    const saveState = async (currentState) => {
        if (!currentState.user) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({
                    game_data: {
                        gold: currentState.gold,
                        diamond: currentState.diamond,
                        currentWeaponId: currentState.currentWeaponId,
                        weaponLevel: currentState.weaponLevel,
                        clickDamage: currentState.clickDamage,
                        moveSpeed: currentState.moveSpeed,
                        attackRange: currentState.attackRange,
                        playerPos: currentState.playerPos,
                        currentScene: currentState.currentScene,
                        mushrooms: currentState.mushrooms,
                        criticalChance: currentState.criticalChance,
                        criticalDamage: currentState.criticalDamage,
                        hyperCriticalChance: currentState.hyperCriticalChance,
                        hyperCriticalDamage: currentState.hyperCriticalDamage,
                        megaCriticalChance: currentState.megaCriticalChance,
                        megaCriticalDamage: currentState.megaCriticalDamage,
                        statLevels: currentState.statLevels,
                        obtainedWeapons: currentState.obtainedWeapons,
                        maxStage: currentState.maxStage,
                        currentStage: currentState.currentStage,
                        mushroomCollection: currentState.mushroomCollection,
                        claimedRewards: currentState.claimedRewards,
                        artifacts: currentState.artifacts,
                        worldBoss: currentState.worldBoss,
                        pets: currentState.pets,
                        skins: currentState.skins
                    }
                })
                .eq('id', currentState.user.id);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    };

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
                            obtainedWeapons: [0],
                            pets: {
                                inventory: {},
                                equipped: [],
                                unlockedSlots: 1
                            }
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

            setChatOpen,
            isLoading: state.isLoading
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
