import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const Shop = () => {
    const { state, dispatch, WEAPONS } = useGame();
    const [message, setMessage] = useState(null);

    // Clear message when shop closes or scene changes
    useEffect(() => {
        if (!state.isShopOpen) {
            setMessage(null);
            dispatch({ type: 'CLEAR_RESULT_MSG' });
        }
    }, [state.isShopOpen, dispatch]);

    // Handle result messages from state
    useEffect(() => {
        if (state.lastEnhanceResult === 'success') {
            setMessage({ text: '강화 성공! 🎉', color: '#4caf50' });
        } else if (state.lastEnhanceResult === 'fail') {
            setMessage({ text: '강화 실패... 💥', color: '#f44336' });
        } else if (state.lastEvolveResult === 'success') {
            setMessage({ text: '진화 성공! 🌟', color: '#9c27b0' });
        } else if (state.lastEvolveResult === 'destroyed') {
            setMessage({ text: '무기 파괴됨... ☠️', color: '#d32f2f' });
        } else if (state.lastEvolveResult === 'fail') {
            setMessage({ text: '진화 실패... 💨', color: '#ff9800' });
        }

        if (state.lastEnhanceResult || state.lastEvolveResult) {
            const timer = setTimeout(() => {
                setMessage(null);
                dispatch({ type: 'CLEAR_RESULT_MSG' });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.lastEnhanceResult, state.lastEvolveResult, dispatch]);

    if (state.currentScene !== 'village' || !state.isShopOpen) return null;

    const currentWeapon = WEAPONS[state.currentWeaponId];
    const nextWeapon = WEAPONS[state.currentWeaponId + 1];

    // Enhance Logic
    const enhanceCost = Math.max(10, Math.floor(currentWeapon.cost * (state.weaponLevel + 1) * 0.02));
    const enhanceSuccessRate = 100 - (state.weaponLevel * 10);

    // Evolve Logic
    const evolveCost = nextWeapon ? nextWeapon.cost : 0;
    const evolveSuccessRate = Math.max(5, 100 - (state.currentWeaponId * 2));
    const destructionRate = 5;

    const handleEnhance = () => {
        if (state.gold >= enhanceCost) {
            dispatch({ type: 'ENHANCE_WEAPON' });
        }
    };

    const handleEvolve = () => {
        if (nextWeapon && state.gold >= evolveCost) {
            dispatch({ type: 'EVOLVE_WEAPON' });
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            backgroundColor: '#f5f5f5',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            border: '4px solid #5d4037',
            fontFamily: 'sans-serif'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#3e2723', fontSize: '1.5rem' }}>⚒️ 대장간</h2>
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SHOP' })}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ❌
                </button>
            </div>

            {/* Current Weapon Display */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '8px' }}>{currentWeapon.icon}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>
                    {currentWeapon.name} <span style={{ color: '#1976d2' }}>+{state.weaponLevel}</span>
                </div>
                <div style={{ color: '#666', marginTop: '4px' }}>
                    공격력: <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{state.clickDamage.toLocaleString()}</span>
                </div>
            </div>

            {/* Result Message Overlay */}
            {message && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    color: message.color,
                    border: `2px solid ${message.color}`
                }}>
                    {message.text}
                </div>
            )}

            {/* Action Area */}
            <div style={{ marginTop: '16px' }}>
                {state.weaponLevel < 10 ? (
                    // ENHANCE UI
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span>성공 확률: <b style={{ color: '#4caf50' }}>{enhanceSuccessRate}%</b></span>
                            <span>비용: <b style={{ color: '#ff9800' }}>{enhanceCost.toLocaleString()} G</b></span>
                        </div>
                        <button
                            onClick={handleEnhance}
                            disabled={state.gold < enhanceCost}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: state.gold >= enhanceCost ? '#1976d2' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: state.gold >= enhanceCost ? 'pointer' : 'not-allowed',
                                boxShadow: state.gold >= enhanceCost ? '0 4px 0 #0d47a1' : 'none',
                                transform: state.gold >= enhanceCost ? 'translateY(0)' : 'translateY(2px)',
                                transition: 'all 0.1s'
                            }}
                        >
                            강화하기 🔨
                        </button>
                    </div>
                ) : nextWeapon ? (
                    // EVOLVE UI
                    <div>
                        <div style={{
                            backgroundColor: '#fff3e0',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: '1px solid #ffe0b2'
                        }}>
                            <div style={{ fontWeight: 'bold', color: '#e65100', marginBottom: '4px', textAlign: 'center' }}>
                                🔥 진화 가능!
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span>{currentWeapon.icon}</span> ➡️ <span>{nextWeapon.icon}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                <div>✅ 성공 확률: <b>{evolveSuccessRate}%</b></div>
                                <div>☠️ 파괴 확률: <b style={{ color: '#d32f2f' }}>{destructionRate}%</b> (0강 초기화)</div>
                                <div>💰 비용: <b>{evolveCost.toLocaleString()} G</b></div>
                            </div>
                        </div>
                        <button
                            onClick={handleEvolve}
                            disabled={state.gold < evolveCost}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: state.gold >= evolveCost ? '#9c27b0' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: state.gold >= evolveCost ? 'pointer' : 'not-allowed',
                                boxShadow: state.gold >= evolveCost ? '0 4px 0 #7b1fa2' : 'none'
                            }}
                        >
                            진화 시도 ✨
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '10px' }}>
                        ✨ 전설의 무기를 모두 모으셨습니다! ✨
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shop;
