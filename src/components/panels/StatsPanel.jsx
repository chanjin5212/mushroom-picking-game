import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatNumber';
import StatItem from './stats/StatItem';
import CriticalSection from './stats/CriticalSection';

const StatsPanel = () => {
    const { state, dispatch } = useGame();
    const [upgradeMultiplier, setUpgradeMultiplier] = useState(1);

    // For hold-to-repeat functionality
    const holdIntervalRef = useRef(null);
    const holdTimeoutRef = useRef(null);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Tiered Cost Calculation Helper (for Damage stats)
    const calculateTieredCost = (baseCost, level) => {
        // Level^3 scaling for critical damage to allow max level before next tier
        return Math.floor(baseCost * Math.pow(level + 1, 3));
    };

    // Linear Cost Calculation Helper (for Chance stats)
    const calculateLinearCost = (baseCost, level) => {
        return Math.floor(baseCost * (level + 1));
    };

    // Helper to calculate bulk cost and valid count
    const calculateBulkUpgrade = (statType, currentLevel, count) => {
        let totalCost = 0;
        let validCount = 0;
        let tempLevel = currentLevel;
        let maxLevel = Infinity;
        let baseCost = 0;
        let isTiered = false;

        // Determine params (must match GameContext logic)
        if (statType === 'critChance') {
            maxLevel = 1000;
            baseCost = 1000;
            isTiered = false;
        } else if (statType === 'critDamage') {
            maxLevel = 100000;
            baseCost = 1; // 1/1000 of Normal Chance Cost (1000)
            isTiered = true;
        } else if (statType === 'hyperCritChance') {
            maxLevel = 1000;
            baseCost = 1e15; // 1,000C
            isTiered = false;
        } else if (statType === 'hyperCritDamage') {
            maxLevel = 100000;
            baseCost = 1e12; // 1C
            isTiered = true;
        } else if (statType === 'megaCritChance') {
            maxLevel = 1000;
            baseCost = 1e30; // 100G
            isTiered = false;
        } else if (statType === 'megaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e27; // 100F
            isTiered = true;
        } else if (statType === 'gigaCritChance') {
            maxLevel = 1000;
            baseCost = 1e45; // 10K
            isTiered = false;
        } else if (statType === 'gigaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e42; // 1,000J
            isTiered = true;
        } else if (statType === 'teraCritChance') {
            maxLevel = 1000;
            baseCost = 1e60; // 1O
            isTiered = false;
        } else if (statType === 'teraCritDamage') {
            maxLevel = 100000;
            baseCost = 1e57; // 100N
            isTiered = true;
        } else if (statType === 'petaCritChance') {
            maxLevel = 1000;
            baseCost = 1e75; // 1,000R
            isTiered = false;
        } else if (statType === 'petaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e72; // 10R
            isTiered = true;
        } else if (statType === 'exaCritChance') {
            maxLevel = 1000;
            baseCost = 1e90; // 100V
            isTiered = false;
        } else if (statType === 'exaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e87; // 1V
            isTiered = true;
        } else if (statType === 'zettaCritChance') {
            maxLevel = 1000;
            baseCost = 1e105; // 10Z
            isTiered = false;
        } else if (statType === 'zettaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e102; // 1,000Y
            isTiered = true;
        } else if (statType === 'yottaCritChance') {
            maxLevel = 1000;
            baseCost = 1e120; // 1AD
            isTiered = false;
        } else if (statType === 'yottaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e117; // 100AC
            isTiered = true;
        } else if (statType === 'ronnaCritChance') {
            maxLevel = 1000;
            baseCost = 1e135; // 1,000AG
            isTiered = false;
        } else if (statType === 'ronnaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e132; // 10AG
            isTiered = true;
        } else if (statType === 'quettaCritChance') {
            maxLevel = 1000;
            baseCost = 1e150; // 100AK
            isTiered = false;
        } else if (statType === 'quettaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e147; // 1AK
            isTiered = true;
        } else if (statType === 'xenoCritChance') {
            maxLevel = 1000;
            baseCost = 1e165; // 10AO
            isTiered = false;
        } else if (statType === 'xenoCritDamage') {
            maxLevel = 100000;
            baseCost = 1e162; // 1,000AN
            isTiered = true;
        } else if (statType === 'ultimaCritChance') {
            maxLevel = 1000;
            baseCost = 1e180; // 1AS
            isTiered = false;
        } else if (statType === 'ultimaCritDamage') {
            maxLevel = 100000;
            baseCost = 1e177; // 100AQ
            isTiered = true;
        } else if (statType === 'omniCritChance') {
            maxLevel = 1000;
            baseCost = 1e195; // 1,000AV
            isTiered = false;
        } else if (statType === 'omniCritDamage') {
            maxLevel = 100000;
            baseCost = 1e192; // 10AV
            isTiered = true;
        } else if (statType === 'absoluteCritChance') {
            maxLevel = 1000;
            baseCost = 1e210; // 100AZ
            isTiered = false;
        } else if (statType === 'absoluteCritDamage') {
            maxLevel = 100000;
            baseCost = 1e207; // 1AZ
            isTiered = true;
        } else if (statType === 'infinityCritChance') {
            maxLevel = 1000;
            baseCost = 1e225; // 10BD
            isTiered = false;
        } else if (statType === 'infinityCritDamage') {
            maxLevel = 100000;
            baseCost = 1e222; // 1,000BC
            isTiered = true;
        } else if (statType === 'moveSpeed') {
            maxLevel = 300;
            baseCost = 500;
            isTiered = true;
        } else if (statType === 'attackRange') {
            maxLevel = 300;
            baseCost = 500;
            isTiered = true;
        }

        for (let i = 0; i < count; i++) {
            if (tempLevel >= maxLevel && maxLevel !== Infinity) break;

            let stepCost = isTiered
                ? calculateTieredCost(baseCost, tempLevel)
                : calculateLinearCost(baseCost, tempLevel);

            totalCost += stepCost;
            tempLevel++;
            validCount++;
        }

        return { totalCost, validCount };
    };

    // Calculate costs for current multiplier
    const getUpgradeInfo = (statType) => {
        const currentLevel = state.statLevels?.[statType] || 0;
        return calculateBulkUpgrade(statType, currentLevel, upgradeMultiplier);
    };

    const handleUpgradeStat = (statType) => {
        const currentState = stateRef.current;
        const currentLevel = currentState.statLevels?.[statType] || 0;

        // Calculate cost for current multiplier
        const { totalCost, validCount } = calculateBulkUpgrade(statType, currentLevel, upgradeMultiplier);

        if (validCount === 0) {
            stopHold();
            return;
        }

        if (currentState.gold >= totalCost) {
            dispatch({ type: 'UPGRADE_STAT', payload: { statType, count: validCount } });
        } else {
            // Optional: Stop holding if not enough gold
            // stopHold(); 
        }
    };

    // Hold to repeat handlers with progressive acceleration
    const startHold = (action) => {
        // Execute immediately
        action();

        let currentInterval = 100; // Start at 100ms
        const minInterval = 20; // Maximum speed at 20ms
        const acceleration = 5; // Decrease interval by 5ms each iteration

        // Start repeating after 500ms delay
        holdTimeoutRef.current = setTimeout(() => {
            const repeatAction = () => {
                action();

                // Decrease interval for next iteration (speed up)
                currentInterval = Math.max(minInterval, currentInterval - acceleration);

                // Schedule next action with new interval
                holdIntervalRef.current = setTimeout(repeatAction, currentInterval);
            };

            // Start the progressive acceleration
            repeatAction();
        }, 500);
    };

    const stopHold = () => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
        if (holdIntervalRef.current) {
            clearTimeout(holdIntervalRef.current);
            holdIntervalRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopHold();
    }, []);

    // --- Data Preparation ---

    const moveSpeedInfo = getUpgradeInfo('moveSpeed');
    const attackRangeInfo = getUpgradeInfo('attackRange');
    const critChanceInfo = getUpgradeInfo('critChance');
    const critDamageInfo = getUpgradeInfo('critDamage');

    // Advanced Critical Tiers Configuration
    const criticalTiers = [
        {
            name: '하이퍼',
            color: '#ff6b6b',
            unlockCondition: (state.statLevels?.critChance || 0) >= 1000,
            unlockMessage: '치명타 Lv.1000 해제',
            chanceStat: 'hyperCritChance',
            damageStat: 'hyperCritDamage',
            chanceValue: state.hyperCriticalChance,
            damageValue: state.hyperCriticalDamage
        },
        {
            name: '메가',
            color: '#8A2BE2',
            unlockCondition: (state.statLevels?.hyperCritChance || 0) >= 1000,
            unlockMessage: '하이퍼 치명타 Lv.1000 해제',
            chanceStat: 'megaCritChance',
            damageStat: 'megaCritDamage',
            chanceValue: state.megaCriticalChance,
            damageValue: state.megaCriticalDamage
        },
        {
            name: '기가',
            color: '#FFD700',
            unlockCondition: (state.statLevels?.megaCritChance || 0) >= 1000,
            unlockMessage: '메가 치명타 Lv.1000 해제',
            chanceStat: 'gigaCritChance',
            damageStat: 'gigaCritDamage',
            chanceValue: state.gigaCriticalChance,
            damageValue: state.gigaCriticalDamage
        },
        {
            name: '테라',
            color: '#00CED1',
            unlockCondition: (state.statLevels?.gigaCritChance || 0) >= 1000,
            unlockMessage: '기가 치명타 Lv.1000 해제',
            chanceStat: 'teraCritChance',
            damageStat: 'teraCritDamage',
            chanceValue: state.teraCriticalChance,
            damageValue: state.teraCriticalDamage
        },
        {
            name: '페타',
            color: '#FF4500',
            unlockCondition: (state.statLevels?.teraCritChance || 0) >= 1000,
            unlockMessage: '테라 치명타 Lv.1000 해제',
            chanceStat: 'petaCritChance',
            damageStat: 'petaCritDamage',
            chanceValue: state.petaCriticalChance,
            damageValue: state.petaCriticalDamage
        },
        {
            name: '엑사',
            color: '#32CD32',
            unlockCondition: (state.statLevels?.petaCritChance || 0) >= 1000,
            unlockMessage: '페타 치명타 Lv.1000 해제',
            chanceStat: 'exaCritChance',
            damageStat: 'exaCritDamage',
            chanceValue: state.exaCriticalChance,
            damageValue: state.exaCriticalDamage
        },
        {
            name: '제타',
            color: '#1E90FF',
            unlockCondition: (state.statLevels?.exaCritChance || 0) >= 1000,
            unlockMessage: '엑사 치명타 Lv.1000 해제',
            chanceStat: 'zettaCritChance',
            damageStat: 'zettaCritDamage',
            chanceValue: state.zettaCriticalChance,
            damageValue: state.zettaCriticalDamage
        },
        {
            name: '요타',
            color: '#9400D3',
            unlockCondition: (state.statLevels?.zettaCritChance || 0) >= 1000,
            unlockMessage: '제타 치명타 Lv.1000 해제',
            chanceStat: 'yottaCritChance',
            damageStat: 'yottaCritDamage',
            chanceValue: state.yottaCriticalChance,
            damageValue: state.yottaCriticalDamage
        },
        {
            name: '로나',
            color: '#FF1493',
            unlockCondition: (state.statLevels?.yottaCritChance || 0) >= 1000,
            unlockMessage: '요타 치명타 Lv.1000 해제',
            chanceStat: 'ronnaCritChance',
            damageStat: 'ronnaCritDamage',
            chanceValue: state.ronnaCriticalChance,
            damageValue: state.ronnaCriticalDamage
        },
        {
            name: '퀘타',
            color: '#00FA9A',
            unlockCondition: (state.statLevels?.ronnaCritChance || 0) >= 1000,
            unlockMessage: '로나 치명타 Lv.1000 해제',
            chanceStat: 'quettaCritChance',
            damageStat: 'quettaCritDamage',
            chanceValue: state.quettaCriticalChance,
            damageValue: state.quettaCriticalDamage
        },
        {
            name: '제노',
            color: '#DC143C',
            unlockCondition: (state.statLevels?.quettaCritChance || 0) >= 1000,
            unlockMessage: '퀘타 치명타 Lv.1000 해제',
            chanceStat: 'xenoCritChance',
            damageStat: 'xenoCritDamage',
            chanceValue: state.xenoCriticalChance,
            damageValue: state.xenoCriticalDamage
        },
        {
            name: '얼티마',
            color: '#7B68EE',
            unlockCondition: (state.statLevels?.xenoCritChance || 0) >= 1000,
            unlockMessage: '제노 치명타 Lv.1000 해제',
            chanceStat: 'ultimaCritChance',
            damageStat: 'ultimaCritDamage',
            chanceValue: state.ultimaCriticalChance,
            damageValue: state.ultimaCriticalDamage
        },
        {
            name: '옴니',
            color: '#FFD700',
            unlockCondition: (state.statLevels?.ultimaCritChance || 0) >= 1000,
            unlockMessage: '얼티마 치명타 Lv.1000 해제',
            chanceStat: 'omniCritChance',
            damageStat: 'omniCritDamage',
            chanceValue: state.omniCriticalChance,
            damageValue: state.omniCriticalDamage
        },
        {
            name: '앱솔루트',
            color: '#FFFFFF',
            unlockCondition: (state.statLevels?.omniCritChance || 0) >= 1000,
            unlockMessage: '옴니 치명타 Lv.1000 해제',
            chanceStat: 'absoluteCritChance',
            damageStat: 'absoluteCritDamage',
            chanceValue: state.absoluteCriticalChance,
            damageValue: state.absoluteCriticalDamage
        },
        {
            name: '인피니티',
            color: '#000000',
            unlockCondition: (state.statLevels?.absoluteCritChance || 0) >= 1000,
            unlockMessage: '앱솔루트 치명타 Lv.1000 해제',
            chanceStat: 'infinityCritChance',
            damageStat: 'infinityCritDamage',
            chanceValue: state.infinityCriticalChance,
            damageValue: state.infinityCriticalDamage
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 20px' }}>
            {/* Multiplier Toggles */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: '15px' }}>
                {[1, 10, 100, 1000].map(mul => (
                    <button
                        key={mul}
                        onClick={() => setUpgradeMultiplier(mul)}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: upgradeMultiplier === mul ? '#2196f3' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}
                    >
                        x{mul}
                    </button>
                ))}
            </div>

            {/* Attack Range */}
            <StatItem
                label="공격 범위"
                value={state.attackRange.toFixed(0)}
                level={state.statLevels?.attackRange || 0}
                maxLevel={300}
                cost={attackRangeInfo.totalCost}
                validCount={attackRangeInfo.validCount}
                canUpgrade={state.gold >= attackRangeInfo.totalCost && attackRangeInfo.validCount > 0}
                onUpgrade={() => handleUpgradeStat('attackRange')}
                startHold={startHold}
                stopHold={stopHold}
                renderValue={(v) => v}
                color="#2196f3"
                icon="🏹"
            />

            {/* Move Speed */}
            <StatItem
                label="이동속도"
                value={state.moveSpeed.toFixed(2)}
                level={state.statLevels?.moveSpeed || 0}
                maxLevel={300}
                cost={moveSpeedInfo.totalCost}
                validCount={moveSpeedInfo.validCount}
                canUpgrade={state.gold >= moveSpeedInfo.totalCost && moveSpeedInfo.validCount > 0}
                onUpgrade={() => handleUpgradeStat('moveSpeed')}
                startHold={startHold}
                stopHold={stopHold}
                renderValue={(v) => v}
                color="#4caf50"
                icon="🏃"
            />

            {/* Basic Crit Chance */}
            <StatItem
                label="치명타 확률"
                value={state.criticalChance.toFixed(1)}
                level={state.statLevels?.critChance || 0}
                maxLevel={1000}
                cost={critChanceInfo.totalCost}
                validCount={critChanceInfo.validCount * 0.1}
                canUpgrade={state.gold >= critChanceInfo.totalCost && critChanceInfo.validCount > 0}
                onUpgrade={() => handleUpgradeStat('critChance')}
                startHold={startHold}
                stopHold={stopHold}
                renderValue={(v) => `${v}%`}
                color="#4caf50"
                icon="🎯"
            />

            {/* Basic Crit Damage */}
            <StatItem
                label="치명타 데미지"
                value={state.criticalDamage}
                level={state.statLevels?.critDamage || 0}
                maxLevel={100000}
                cost={critDamageInfo.totalCost}
                validCount={critDamageInfo.validCount}
                canUpgrade={state.gold >= critDamageInfo.totalCost && critDamageInfo.validCount > 0}
                onUpgrade={() => handleUpgradeStat('critDamage')}
                startHold={startHold}
                stopHold={stopHold}
                renderValue={(v) => `${v}%`}
                color="#f44336"
                icon="💥"
            />

            {/* Advanced Critical Tiers */}
            {criticalTiers.map((tier) => {
                const chanceInfo = getUpgradeInfo(tier.chanceStat);
                const damageInfo = getUpgradeInfo(tier.damageStat);

                return (
                    <CriticalSection
                        key={tier.name}
                        tierName={tier.name}
                        color={tier.color}
                        isUnlocked={tier.unlockCondition}
                        unlockMessage={tier.unlockMessage}
                        startHold={startHold}
                        stopHold={stopHold}
                        gold={state.gold}
                        chanceStat={{
                            value: tier.chanceValue,
                            level: state.statLevels?.[tier.chanceStat] || 0,
                            maxLevel: 1000,
                            info: chanceInfo,
                            onUpgrade: () => handleUpgradeStat(tier.chanceStat)
                        }}
                        damageStat={{
                            value: tier.damageValue,
                            level: state.statLevels?.[tier.damageStat] || 0,
                            maxLevel: 100000,
                            info: damageInfo,
                            onUpgrade: () => handleUpgradeStat(tier.damageStat)
                        }}
                    />
                );
            })}
        </div>
    );
};

export default StatsPanel;
