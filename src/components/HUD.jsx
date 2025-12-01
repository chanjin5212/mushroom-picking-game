import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatNumber';
import RankingBoard from './RankingBoard';
import UserInfoModal from './UserInfoModal';
import WeaponCollection from './WeaponCollection';

const HUD = () => {
    const { state, fetchRankings } = useGame();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showCollection, setShowCollection] = useState(false);
    const [stageRank, setStageRank] = useState(null);

    // Fetch stage ranking
    useEffect(() => {
        const fetchStageRank = async () => {
            if (!state.user) return;

            const rankings = await fetchRankings('stage');
            const myRank = rankings.findIndex(r => r.username === state.user.username);
            setStageRank(myRank >= 0 ? myRank + 1 : null);
        };

        fetchStageRank();
        // Refresh ranking every 30 seconds
        const interval = setInterval(fetchStageRank, 30000);
        return () => clearInterval(interval);
    }, [state.user, state.currentStage, state.maxStage]);

    // Combat Power Formula: Base Damage * (1 + CritChance/100 * CritDamage/100) * (1 + HyperCritChance/100 * HyperCritDamage/100) * (1 + MegaCritChance/100 * MegaCritDamage/100)
    const calculateCombatPower = () => {
        const baseDmg = state.clickDamage;
        const critMultiplier = 1 + (state.criticalChance / 100) * (state.criticalDamage / 100);
        const hyperCritMultiplier = 1 + (state.hyperCriticalChance / 100) * (state.hyperCriticalDamage / 100);
        const megaCritMultiplier = 1 + (state.megaCriticalChance / 100) * (state.megaCriticalDamage / 100);
        return Math.floor(baseDmg * critMultiplier * hyperCritMultiplier * megaCritMultiplier);
    };

    const combatPower = calculateCombatPower();

    // Mock ranking - will be replaced with real data later
    const mockRanking = 42;

    return (
        <>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                zIndex: 1100,
                borderBottom: '2px solid rgba(255,215,0,0.3)'
            }}>
                {/* Left: Character Image + Player Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    {/* Character Avatar */}
                    <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        border: '2px solid rgba(255,215,0,0.5)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        flexShrink: 0
                    }}>
                        {state.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* Player Info Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                        {/* Username */}
                        <div style={{
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {state.user?.username || 'Guest'}
                        </div>

                        {/* Stats Row - All in one line */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'nowrap'
                        }}>
                            {/* Stage Ranking */}
                            {stageRank !== null && (
                                <div style={{
                                    backgroundColor: 'rgba(255,215,0,0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,215,0,0.4)',
                                    fontSize: '0.7rem',
                                    color: '#ffd700',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {stageRank}위
                                </div>
                            )}

                            {/* Combat Power */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.7rem',
                                color: '#ff6b6b',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                            }}>
                                <span>⚔️</span>
                                <span>{formatNumber(combatPower)}</span>
                            </div>

                            {/* Gold */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.7rem',
                                color: '#ffc107',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                            }}>
                                <span>💰</span>
                                <span>{formatNumber(state.gold)}</span>
                            </div>

                            {/* Diamond */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.7rem',
                                color: '#00bcd4',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                            }}>
                                <span>💎</span>
                                <span>{formatNumber(state.diamond)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Menu Button */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            padding: '8px 10px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            minWidth: '38px',
                            minHeight: '38px'
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
                                top: '50px',
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
