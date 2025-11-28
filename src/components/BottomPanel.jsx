import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatNumber';

const BottomPanel = () => {
    const { state, dispatch, WEAPONS } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('weapon'); // 'weapon' or 'stats'

    // For hold-to-repeat functionality
    const holdIntervalRef = useRef(null);
    const holdTimeoutRef = useRef(null);

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
        let exponent = 1.2;
        if (level >= 100) exponent = 2.0; // Steep for high levels
        else if (level >= 10) exponent = 1.5; // Moderate for mid levels

        return Math.floor(baseCost * Math.pow(level + 1, exponent));
    };

    // Linear Cost Calculation Helper (for Chance stats)
    const calculateLinearCost = (baseCost, level) => {
        return Math.floor(baseCost * (level + 1));
    };

    // Stat Upgrade Logic - linear for Chance, tiered for Damage
    const critChanceCost = calculateLinearCost(1000, state.statLevels?.critChance || 0);
    const critDamageCost = calculateTieredCost(800, state.statLevels?.critDamage || 0);
    const hyperCritChanceCost = calculateLinearCost(10000000, state.statLevels?.hyperCritChance || 0);
    const hyperCritDamageCost = calculateTieredCost(5000000, state.statLevels?.hyperCritDamage || 0);


    const handleEnhance = () => {
        // Safety check: stop if weapon level is 10 or higher
        if (state.weaponLevel >= 10) {
            stopHold();
            return;
        }
        if (state.gold >= enhanceCost) {
            dispatch({ type: 'ENHANCE_WEAPON' });
        }
    };

    const handleEvolve = () => {
        if (nextWeapon && state.gold >= evolveCost) {
            dispatch({ type: 'EVOLVE_WEAPON' });
        }
    };

    const handleUpgradeStat = (statType) => {
        let cost;
        if (statType === 'critChance') cost = critChanceCost;
        else if (statType === 'critDamage') cost = critDamageCost;
        else if (statType === 'hyperCritChance') cost = hyperCritChanceCost;
        else if (statType === 'hyperCritDamage') cost = hyperCritDamageCost;

        if (state.gold >= cost) {
            dispatch({ type: 'UPGRADE_STAT', payload: { statType, cost } });
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

    // Stop hold when weapon level changes (e.g., reaches level 10)
    useEffect(() => {
        return () => {
            stopHold();
        };
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
                    📊 스탯
                </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {activeTab === 'weapon' && (
                    <div style={{ textAlign: 'center' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                                    disabled={state.gold < critChanceCost}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: state.gold >= critChanceCost ? '#4caf50' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: state.gold >= critChanceCost ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+0.1%) - 누르고 있으면 반복</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(critChanceCost)} G</span>
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
                                disabled={state.gold < critDamageCost}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: state.gold >= critDamageCost ? '#f44336' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: state.gold >= critDamageCost ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>강화 (+1%) - 누르고 있으면 반복</span>
                                <span style={{ color: '#ffeb3b' }}>{formatNumber(critDamageCost)} G</span>
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
                                    disabled={state.gold < hyperCritChanceCost || (state.statLevels?.critChance || 0) < 1000}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: (state.gold >= hyperCritChanceCost && (state.statLevels?.critChance || 0) >= 1000) ? '#ff6b6b' : '#555',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: (state.gold >= hyperCritChanceCost && (state.statLevels?.critChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span>강화 (+0.1%) - 누르고 있으면 반복</span>
                                    <span style={{ color: '#ffeb3b' }}>{formatNumber(hyperCritChanceCost)} G</span>
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
                                disabled={state.gold < hyperCritDamageCost || (state.statLevels?.critChance || 0) < 1000}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: (state.gold >= hyperCritDamageCost && (state.statLevels?.critChance || 0) >= 1000) ? '#ff8e53' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: (state.gold >= hyperCritDamageCost && (state.statLevels?.critChance || 0) >= 1000) ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>강화 (+1%) - 누르고 있으면 반복</span>
                                <span style={{ color: '#ffeb3b' }}>{formatNumber(hyperCritDamageCost)} G</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BottomPanel;
