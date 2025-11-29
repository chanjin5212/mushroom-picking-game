import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatNumber';
import RankingBoard from './RankingBoard';
import UserInfoModal from './UserInfoModal';
import WeaponCollection from './WeaponCollection';

const HUD = () => {
    const { state } = useGame();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showCollection, setShowCollection] = useState(false);

    // Combat Power Formula: Base Damage * (1 + CritChance/100 * CritDamage/100) * (1 + HyperCritChance/100 * HyperCritDamage/100)
    const calculateCombatPower = () => {
        const baseDmg = state.clickDamage;
        const critMultiplier = 1 + (state.criticalChance / 100) * (state.criticalDamage / 100);
        const hyperCritMultiplier = 1 + (state.hyperCriticalChance / 100) * (state.hyperCriticalDamage / 100);
        return Math.floor(baseDmg * critMultiplier * hyperCritMultiplier);
    };

    const combatPower = calculateCombatPower();

    return (
        <>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 15px',
                zIndex: 1100,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Left: User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {state.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                        {state.user?.username || 'Guest'}
                    </div>
                </div>

                {/* Center: Stats */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'rgba(156,39,176,0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid rgba(156,39,176,0.4)'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>⚔️</span>
                        <span style={{ color: '#ab47bc', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {formatNumber(combatPower)}
                        </span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: 'rgba(255,193,7,0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,193,7,0.4)'
                    }}>
                        <span style={{ fontSize: '1.1rem' }}>💰</span>
                        <span style={{ color: '#ffc107', fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {formatNumber(state.gold)}
                        </span>
                    </div>
                </div>

                {/* Right: Menu Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        ☰
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <>
                            {/* Backdrop to close menu */}
                            <div
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 99
                                }}
                            />

                            {/* Menu Items */}
                            <div style={{
                                position: 'absolute',
                                top: '45px',
                                right: 0,
                                backgroundColor: 'rgba(30,30,30,0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                minWidth: '150px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                zIndex: 100
                            }}>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowRanking(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffd700',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,215,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span>🏆</span>
                                    <span>랭킹</span>
                                </button>

                                <div style={{
                                    height: '1px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    margin: '0'
                                }} />

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowCollection(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ff9800',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,152,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span>📖</span>
                                    <span>도감</span>
                                </button>

                                <div style={{
                                    height: '1px',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    margin: '0'
                                }} />

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        setShowUserInfo(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#fff',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span>👤</span>
                                    <span>내 정보</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showRanking && (
                <RankingBoard onClose={() => setShowRanking(false)} />
            )}

            {showUserInfo && (
                <UserInfoModal onClose={() => setShowUserInfo(false)} />
            )}

            {/* Weapon Collection Modal */}
            {showCollection && (
                <WeaponCollection onClose={() => setShowCollection(false)} />
            )}
        </>
    );
};

export default HUD;
