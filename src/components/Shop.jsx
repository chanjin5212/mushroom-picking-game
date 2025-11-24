import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Shop = () => {
    const { state, dispatch, WEAPONS } = useGame();

    if (state.currentScene !== 'village' || !state.isShopOpen) return null;

    const currentWeapon = WEAPONS[state.currentWeaponId];
    const nextWeapon = WEAPONS[state.currentWeaponId + 1];

    const upgradeCost = Math.floor(currentWeapon.baseDamage * 2 * Math.pow(1.3, state.weaponLevel));

    const handleBuyWeapon = () => {
        if (nextWeapon && state.gold >= nextWeapon.cost) {
            dispatch({ type: 'BUY_WEAPON' });
        }
    };

    const handleUpgrade = () => {
        if (state.gold >= upgradeCost) {
            dispatch({ type: 'UPGRADE_WEAPON' });
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            backgroundColor: 'var(--color-panel)',
            borderRadius: 'var(--border-radius)',
            padding: '20px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            border: '2px solid #8d6e63'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#5d4037' }}>⚔️ 대장간</h2>
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_SHOP' })}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ❌
                </button>
            </div>

            {/* Current Weapon Info */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2rem' }}>{currentWeapon.icon}</span>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{currentWeapon.name} (+{state.weaponLevel})</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>강화 보너스: +{currentWeapon.upgradeBonus}/레벨</div>
                    </div>
                </div>
                <div style={{ color: '#666' }}>현재 공격력: <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{state.clickDamage}</span></div>
            </div>

            {/* Upgrade Current Weapon */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '10px',
                border: '1px solid #eee',
                borderRadius: '8px'
            }}>
                <div>
                    <div style={{ fontWeight: 'bold' }}>강화하기</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>공격력 +{currentWeapon.upgradeBonus}</div>
                </div>
                <button
                    onClick={handleUpgrade}
                    disabled={state.gold < upgradeCost}
                    style={{
                        backgroundColor: state.gold >= upgradeCost ? 'var(--color-primary)' : '#ccc',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: state.gold >= upgradeCost ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold'
                    }}
                >
                    {upgradeCost} G
                </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '20px 0' }} />

            {/* Buy Next Weapon */}
            {nextWeapon ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>{nextWeapon.icon}</span>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#388e3c' }}>{nextWeapon.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>기본 공격력 {nextWeapon.baseDamage} (+{nextWeapon.upgradeBonus}/레벨)</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleBuyWeapon}
                        disabled={state.gold < nextWeapon.cost}
                        style={{
                            backgroundColor: state.gold >= nextWeapon.cost ? '#4caf50' : '#ccc',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: state.gold >= nextWeapon.cost ? 'pointer' : 'not-allowed',
                            fontWeight: 'bold'
                        }}
                    >
                        구매 {nextWeapon.cost} G
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '10px' }}>
                    ✨ 전설의 무기를 모두 모으셨습니다! ✨
                </div>
            )}
        </div>
    );
};

export default Shop;
