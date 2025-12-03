import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatNumber';

const WeaponPanel = () => {
    const { state, dispatch, WEAPONS } = useGame();

    // For hold-to-repeat functionality
    const holdIntervalRef = useRef(null);
    const holdTimeoutRef = useRef(null);
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

    // Stop hold when weapon level reaches 10 (evolve becomes available)
    useEffect(() => {
        if (state.weaponLevel >= 10) {
            stopHold();
        }
    }, [state.weaponLevel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopHold();
    }, []);

    return (
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
    );
};

export default WeaponPanel;
