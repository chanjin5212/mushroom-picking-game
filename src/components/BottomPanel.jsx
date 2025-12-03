import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatNumber';
import ArtifactPanel from './ArtifactPanel';
import PetPanel from './PetPanel';

const BottomPanel = () => {
    const { state, dispatch, WEAPONS } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('weapon'); // 'weapon' or 'stats' or 'artifacts' or 'pets'
    const [upgradeMultiplier, setUpgradeMultiplier] = useState(1);

    // For hold-to-repeat functionality
    const holdIntervalRef = useRef(null);
    const holdTimeoutRef = useRef(null);

    // Keep track of latest state for hold actions
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const currentWeapon = WEAPONS[state.currentWeaponId];
    const nextWeapon = WEAPONS[state.currentWeaponId + 1];

    // Enhance Logic - increased cost with exponential scaling
    const enhanceCost = Math.max(100, Math.floor(currentWeapon.cost * Math.pow(state.weaponLevel + 1, 1.5) * 0.01));
    const enhanceSuccessRate = 100 - (state.weaponLevel * 5);

    // Evolve Logic
    const evolveCost = nextWeapon ? nextWeapon.cost : 0;
    const evolveSuccessRate = Math.max(5, 100 - (state.currentWeaponId * 2));
    const destructionRate = 5;


    // Tiered Cost Calculation Helper (for Damage stats)
    const calculateTieredCost = (baseCost, level) => {
        let exponent = 1.1; // Reduced from 1.2/1.5/2.0 to 1.1 for better scaling
        if (level >= 10000) exponent = 1.2;
        else if (level >= 1000) exponent = 1.15;

        return Math.floor(baseCost * Math.pow(level + 1, exponent));
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
            baseCost = 800;
            isTiered = true;
        } else if (statType === 'hyperCritChance') {
            maxLevel = 1000;
            baseCost = 10000000; // 10M
            isTiered = false;
        } else if (statType === 'hyperCritDamage') {
            maxLevel = 100000;
            baseCost = 100000000; // 100M
            isTiered = true;
        } else if (statType === 'moveSpeed') {
            maxLevel = 300;
            baseCost = 500;
            isTiered = true;
        } else if (statType === 'attackRange') {
            maxLevel = 300;
            baseCost = 500;
            isTiered = true;
        } else if (statType === 'megaCritChance') {
            maxLevel = 1000;
            baseCost = 20000000000; // 20B
            isTiered = false;
        } else if (statType === 'megaCritDamage') {
            maxLevel = 100000;
            baseCost = 10000000000; // 10B
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

    const critChanceInfo = getUpgradeInfo('critChance');
    const critDamageInfo = getUpgradeInfo('critDamage');
    const hyperCritChanceInfo = getUpgradeInfo('hyperCritChance');
    const hyperCritDamageInfo = getUpgradeInfo('hyperCritDamage');
    const megaCritChanceInfo = getUpgradeInfo('megaCritChance');
    const megaCritDamageInfo = getUpgradeInfo('megaCritDamage');
    const moveSpeedInfo = getUpgradeInfo('moveSpeed');
    const attackRangeInfo = getUpgradeInfo('attackRange');

    // Move speed max level check
    const moveSpeedMaxLevel = 300;
    const moveSpeedLevel = state.statLevels?.moveSpeed || 0;
    const isMaxMoveSpeed = moveSpeedLevel >= moveSpeedMaxLevel;

    // Attack range max level check
    const attackRangeMaxLevel = 300;
    const attackRangeLevel = state.statLevels?.attackRange || 0;
    const isMaxAttackRange = attackRangeLevel >= attackRangeMaxLevel;


    const handleEnhance = () => {
        // Use stateRef to get the latest state even inside closures
        const currentState = stateRef.current;

        // Safety check: stop if weapon level is 10 or higher
        if (currentState.weaponLevel >= 10) {
            stopHold();
            return;
        }

        // Calculate current enhance cost
        const currentWeapon = WEAPONS[currentState.currentWeaponId];
        const currentEnhanceCost = Math.max(100, Math.floor(currentWeapon.cost * Math.pow(currentState.weaponLevel + 1, 1.5) * 0.01));

        // Stop if not enough gold
        if (currentState.gold < currentEnhanceCost) {
            stopHold();
            return;
        }

        // Reducer will check gold and calculate cost based on current state
        dispatch({ type: 'ENHANCE_WEAPON' });
    };

    const handleEvolve = () => {
        if (nextWeapon && state.gold >= evolveCost) {
            dispatch({ type: 'EVOLVE_WEAPON' });
        }
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
            clearTimeout(holdIntervalRef.current); // Changed from clearInterval to clearTimeout
            holdIntervalRef.current = null;
        }
    };

    // Stop hold when weapon level reaches 10 (evolve becomes available)
    useEffect(() => {
        if (state.weaponLevel >= 10) {
            stopHold();
        }
    }, [state.weaponLevel]);


    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '60vh',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 40px))',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            color: 'white',
            boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Handle / Toggle Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px'
                }} />
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#aaa' }}>
                    {isOpen ? '▼ 닫기' : '▲ 업그레이드'}
                </span>
            </div>

            {/* Tabs */}
            {isOpen && (
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('weapon')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'weapon' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'weapon' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ⚔️ 무기
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'stats' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'stats' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        💪 스탯
                    </button>
                    <button
                        onClick={() => setActiveTab('artifacts')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'artifacts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'artifacts' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                        }}
                    >
                        🏺 유물
                        {(state.currentStage.chapter < 10 || (state.currentStage.chapter === 10 && state.currentStage.stage < 1)) && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                border: '1px solid #ff9800'
                            }}>
                                10-1 해금
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'pets' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'pets' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                        }}
                    >
                        🐾 펫
                        {(state.currentStage.chapter < 10 || (state.currentStage.chapter === 10 && state.currentStage.stage < 1)) && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                border: '1px solid #ff9800'
                            }}>
                                10-1 해금
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                {!isOpen && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>
                        업그레이드 메뉴를 열어주세요
                    </div>
                )}

                {/* Multiplier Toggles (Only visible in Stats tab) */}
                {isOpen && activeTab === 'stats' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginBottom: '15px', padding: '0 20px' }}>
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
                )}

                {activeTab === 'weapon' && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{currentWeapon.icon}</div>
                        <h2 style={{ margin: '0 0 5px 0' }}>{currentWeapon.name} <span style={{ color: '#4caf50' }}>+{state.weaponLevel}</span></h2>
                        <p style={{ color: '#aaa', margin: '0 0 20px 0' }}>공격력: {formatNumber(state.clickDamage)}</p>

                        {state.weaponLevel < 10 ? (
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>성공 확률: <span style={{ color: '#4caf50' }}>{enhanceSuccessRate}%</span></span>
                                    <span>비용: <span style={{ color: '#ffeb3b' }}>{formatNumber(enhanceCost)} G</span></span>
                                </div>
                                <button
                                    onMouseDown={() => startHold(handleEnhance)}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(handleEnhance)}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < enhanceCost}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: state.gold >= enhanceCost ? '#2196f3' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: state.gold >= enhanceCost ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    무기 강화 (누르고 있으면 반복)
                                </button>
                            </div>
                        ) : nextWeapon ? (
                            <div style={{ backgroundColor: 'rgba(255,152,0,0.1)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,152,0,0.3)' }}>
                                <h3 style={{ color: '#ff9800', margin: '0 0 10px 0' }}>진화 가능!</h3>
                                <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                                    <div>다음: {nextWeapon.icon} {nextWeapon.name}</div>
                                    <div>성공: {evolveSuccessRate}% | 파괴: {destructionRate}%</div>
                                    <div>비용: <span style={{ color: '#ffeb3b' }}>{formatNumber(evolveCost)} G</span></div>
                                </div>
                                <button
                                    onClick={handleEvolve}
                                    disabled={state.gold < evolveCost}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: state.gold >= evolveCost ? '#9c27b0' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        cursor: state.gold >= evolveCost ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    무기 진화
                                </button>
                            </div>
                        ) : (
                            <div style={{ color: '#aaa' }}>최고 등급 도달!</div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '0 20px' }}>

                        {/* Attack Range */}
                        <div style={{
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(33, 150, 243, 0.3)'
                        }}>
                            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#2196f3' }}>🏹 공격 범위</span>
                                <span style={{ color: '#fff' }}>{state.attackRange.toFixed(0)}</span>
                            </div>
                            <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#aaa' }}>
                                레벨: {attackRangeLevel} / {attackRangeMaxLevel} (최대 1.5배)
                            </div>
                            {!isMaxAttackRange ? (
                                <button
                                    onMouseDown={() => startHold(() => handleUpgradeStat('attackRange'))}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(() => handleUpgradeStat('attackRange'))}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < attackRangeInfo.totalCost || attackRangeInfo.validCount === 0}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: state.gold >= attackRangeInfo.totalCost ? '#2196f3' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: state.gold >= attackRangeInfo.totalCost ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+{attackRangeInfo.validCount})</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(attackRangeInfo.totalCost)} G</span>
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#2196f3', fontWeight: 'bold' }}>최대 레벨</div>
                            )}
                        </div>

                        {/* Move Speed */}
                        <div style={{
                            backgroundColor: 'rgba(76,175,80,0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(76,175,80,0.3)'
                        }}>
                            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: '#4caf50' }}>🏃 이동속도</span>
                                <span style={{ color: '#fff' }}>{state.moveSpeed.toFixed(2)}</span>
                            </div>
                            <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#aaa' }}>
                                레벨: {moveSpeedLevel} / {moveSpeedMaxLevel} (최대 2배)
                            </div>
                            {!isMaxMoveSpeed ? (
                                <button
                                    onMouseDown={() => startHold(() => handleUpgradeStat('moveSpeed'))}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(() => handleUpgradeStat('moveSpeed'))}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < moveSpeedInfo.totalCost || moveSpeedInfo.validCount === 0}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: state.gold >= moveSpeedInfo.totalCost ? '#4caf50' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: state.gold >= moveSpeedInfo.totalCost ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+{moveSpeedInfo.validCount})</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(moveSpeedInfo.totalCost)} G</span>
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold' }}>최대 레벨</div>
                            )}
                        </div>

                        {/* Crit Chance */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>🎯 치명타 확률</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>레벨: {state.statLevels?.critChance || 0}/1000 ({state.criticalChance.toFixed(1)}%)</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50' }}>
                                    Lv.{state.statLevels?.critChance || 0}
                                </div>
                            </div>
                            {(state.statLevels?.critChance || 0) < 1000 ? (
                                <button
                                    onMouseDown={() => startHold(() => handleUpgradeStat('critChance'))}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(() => handleUpgradeStat('critChance'))}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < critChanceInfo.totalCost || critChanceInfo.validCount === 0}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: state.gold >= critChanceInfo.totalCost ? '#4caf50' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: state.gold >= critChanceInfo.totalCost ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+{(critChanceInfo.validCount * 0.1).toFixed(1)}%)</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(critChanceInfo.totalCost)} G</span>
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#4caf50', fontWeight: 'bold' }}>최대 레벨</div>
                            )}
                        </div>

                        {/* Crit Damage */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>💥 치명타 데미지</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>현재: {state.criticalDamage}%</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f44336' }}>
                                    Lv.{state.statLevels?.critDamage || 0}
                                </div>
                            </div>
                            <button
                                onMouseDown={() => startHold(() => handleUpgradeStat('critDamage'))}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={() => startHold(() => handleUpgradeStat('critDamage'))}
                                onTouchEnd={stopHold}
                                disabled={state.gold < critDamageInfo.totalCost || critDamageInfo.validCount === 0}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: state.gold >= critDamageInfo.totalCost ? '#f44336' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: state.gold >= critDamageInfo.totalCost ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>강화 (+{critDamageInfo.validCount}%)</span>
                                <span style={{ color: '#ffeb3b' }}>{formatNumber(critDamageInfo.totalCost)} G</span>
                            </button>
                        </div>

                        {/* Hyper Critical Section - Always visible, locked until level 100 crit */}
                        <div style={{
                            textAlign: 'center',
                            padding: '10px',
                            background: (state.statLevels?.critChance || 0) >= 1000 ? 'linear-gradient(90deg, #ff6b6b, #ff8e53)' : 'rgba(100,100,100,0.3)',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            opacity: (state.statLevels?.critChance || 0) >= 1000 ? 1 : 0.5
                        }}>
                            {(state.statLevels?.critChance || 0) >= 1000 ? '⚡ 하이퍼 크리티컬 해제됨 ⚡' : '🔒 하이퍼 크리티컬 (치명타 Lv.1000 해제)'}
                        </div>

                        {/* Hyper Crit Chance */}
                        <div style={{
                            backgroundColor: 'rgba(255,107,107,0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,107,107,0.3)',
                            opacity: (state.statLevels?.critChance || 0) >= 1000 ? 1 : 0.5,
                            position: 'relative'
                        }}>
                            {(state.statLevels?.critChance || 0) < 1000 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    zIndex: 10
                                }}>
                                    🔒
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>⚡ 하이퍼 치명타 확률</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>현재: {state.hyperCriticalChance.toFixed(1)}% (최대 100%)</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                                    Lv.{state.statLevels?.hyperCritChance || 0}
                                </div>
                            </div>
                            {state.hyperCriticalChance < 100 ? (
                                <button
                                    onMouseDown={() => startHold(() => handleUpgradeStat('hyperCritChance'))}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(() => handleUpgradeStat('hyperCritChance'))}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < hyperCritChanceInfo.totalCost || hyperCritChanceInfo.validCount === 0 || (state.statLevels?.critChance || 0) < 1000}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: (state.gold >= hyperCritChanceInfo.totalCost && (state.statLevels?.critChance || 0) >= 1000) ? '#ff6b6b' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: (state.gold >= hyperCritChanceInfo.totalCost && (state.statLevels?.critChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+{(hyperCritChanceInfo.validCount * 0.1).toFixed(1)}%)</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(hyperCritChanceInfo.totalCost)} G</span>
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#ff6b6b', fontWeight: 'bold' }}>최대 레벨</div>
                            )}
                        </div>

                        {/* Hyper Crit Damage */}
                        <div style={{
                            backgroundColor: 'rgba(255,107,107,0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,107,107,0.3)',
                            opacity: (state.statLevels?.critChance || 0) >= 1000 ? 1 : 0.5,
                            position: 'relative'
                        }}>
                            {(state.statLevels?.critChance || 0) < 1000 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    zIndex: 10
                                }}>
                                    🔒
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>💥 하이퍼 치명타 데미지</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>현재: {state.hyperCriticalDamage}%</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff8e53' }}>
                                    Lv.{state.statLevels?.hyperCritDamage || 0}
                                </div>
                            </div>
                            <button
                                onMouseDown={() => startHold(() => handleUpgradeStat('hyperCritDamage'))}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={() => startHold(() => handleUpgradeStat('hyperCritDamage'))}
                                onTouchEnd={stopHold}
                                disabled={state.gold < hyperCritDamageInfo.totalCost || hyperCritDamageInfo.validCount === 0 || (state.statLevels?.critChance || 0) < 1000}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: (state.gold >= hyperCritDamageInfo.totalCost && (state.statLevels?.critChance || 0) >= 1000) ? '#ff8e53' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: (state.gold >= hyperCritDamageInfo.totalCost && (state.statLevels?.critChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>강화 (+{hyperCritDamageInfo.validCount}%)</span>
                                <span style={{ color: '#ffeb3b' }}>{formatNumber(hyperCritDamageInfo.totalCost)} G</span>
                            </button>
                        </div>

                        {/* Mega Critical Section - Always visible, locked until level 1000 hyper crit */}
                        <div style={{
                            textAlign: 'center',
                            padding: '10px',
                            background: (state.statLevels?.hyperCritChance || 0) >= 1000 ? 'linear-gradient(90deg, #8A2BE2, #4B0082)' : 'rgba(100,100,100,0.3)',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                            opacity: (state.statLevels?.hyperCritChance || 0) >= 1000 ? 1 : 0.5,
                            color: 'white',
                            boxShadow: (state.statLevels?.hyperCritChance || 0) >= 1000 ? '0 0 10px #8A2BE2' : 'none'
                        }}>
                            {(state.statLevels?.hyperCritChance || 0) >= 1000 ? '🌌 메가 크리티컬 해제됨 🌌' : '🔒 메가 크리티컬 (하이퍼 치명타 Lv.1000 해제)'}
                        </div>

                        {/* Mega Crit Chance */}
                        <div style={{
                            backgroundColor: 'rgba(138, 43, 226, 0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(138, 43, 226, 0.3)',
                            opacity: (state.statLevels?.hyperCritChance || 0) >= 1000 ? 1 : 0.5,
                            position: 'relative'
                        }}>
                            {(state.statLevels?.hyperCritChance || 0) < 1000 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    zIndex: 10
                                }}>
                                    🔒
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#E0B0FF' }}>🌌 메가 치명타 확률</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>현재: {state.megaCriticalChance.toFixed(1)}% (최대 100%)</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8A2BE2' }}>
                                    Lv.{state.statLevels?.megaCritChance || 0}
                                </div>
                            </div>
                            {state.megaCriticalChance < 100 ? (
                                <button
                                    onMouseDown={() => startHold(() => handleUpgradeStat('megaCritChance'))}
                                    onMouseUp={stopHold}
                                    onMouseLeave={stopHold}
                                    onTouchStart={() => startHold(() => handleUpgradeStat('megaCritChance'))}
                                    onTouchEnd={stopHold}
                                    disabled={state.gold < megaCritChanceInfo.totalCost || megaCritChanceInfo.validCount === 0 || (state.statLevels?.hyperCritChance || 0) < 1000}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: (state.gold >= megaCritChanceInfo.totalCost && (state.statLevels?.hyperCritChance || 0) >= 1000) ? '#8A2BE2' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: (state.gold >= megaCritChanceInfo.totalCost && (state.statLevels?.hyperCritChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+{(megaCritChanceInfo.validCount * 0.1).toFixed(1)}%)</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(megaCritChanceInfo.totalCost)} G</span>
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#8A2BE2', fontWeight: 'bold' }}>최대 레벨</div>
                            )}
                        </div>

                        {/* Mega Crit Damage */}
                        <div style={{
                            backgroundColor: 'rgba(75, 0, 130, 0.1)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(75, 0, 130, 0.3)',
                            opacity: (state.statLevels?.hyperCritChance || 0) >= 1000 ? 1 : 0.5,
                            position: 'relative'
                        }}>
                            {(state.statLevels?.hyperCritChance || 0) < 1000 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    zIndex: 10
                                }}>
                                    🔒
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#E0B0FF' }}>🌌 메가 치명타 데미지</div>
                                    <div style={{ color: '#aaa', fontSize: '0.9rem' }}>현재: {state.megaCriticalDamage}%</div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4B0082' }}>
                                    Lv.{state.statLevels?.megaCritDamage || 0}
                                </div>
                            </div>
                            <button
                                onMouseDown={() => startHold(() => handleUpgradeStat('megaCritDamage'))}
                                onMouseUp={stopHold}
                                onMouseLeave={stopHold}
                                onTouchStart={() => startHold(() => handleUpgradeStat('megaCritDamage'))}
                                onTouchEnd={stopHold}
                                disabled={state.gold < megaCritDamageInfo.totalCost || megaCritDamageInfo.validCount === 0 || (state.statLevels?.hyperCritChance || 0) < 1000}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: (state.gold >= megaCritDamageInfo.totalCost && (state.statLevels?.hyperCritChance || 0) >= 1000) ? '#4B0082' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: (state.gold >= megaCritDamageInfo.totalCost && (state.statLevels?.hyperCritChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>강화 (+{megaCritDamageInfo.validCount}%)</span>
                                <span style={{ color: '#ffeb3b' }}>{formatNumber(megaCritDamageInfo.totalCost)} G</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'artifacts' && <ArtifactPanel />}
                {activeTab === 'pets' && <PetPanel />}
            </div>
        </div>
    );
};

export default BottomPanel;
