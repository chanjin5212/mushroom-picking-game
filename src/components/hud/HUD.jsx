import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatNumber';
import RankingBoard from '../modals/RankingBoard';
import UserInfoModal from '../modals/UserInfoModal';
import WeaponCollection from '../modals/WeaponCollection';
import SkinModal from '../modals/SkinModal';

const HUD = () => {
    const { state, fetchRankings } = useGame();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showRanking, setShowRanking] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showCollection, setShowCollection] = useState(false);
    const [showSkins, setShowSkins] = useState(false);
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

    // Combat Power Formula: Base Damage * (1 + CritChance/100 * CritDamage/100) * (1 + HyperCritChance/100 * HyperCritDamage/100) * (1 + MegaCritChance/100 * MegaCritDamage/100) * Pet Multipliers
    const calculateCombatPower = () => {
        // Artifact Bonuses
        const attackBonus = (state.artifacts?.attackBonus?.level || 0) * 0.5;
        const critDamageBonus = (state.artifacts?.critDamageBonus?.level || 0) * 10;
        const hyperCritDamageBonus = (state.artifacts?.hyperCritDamageBonus?.level || 0) * 10;
        const megaCritDamageBonus = (state.artifacts?.megaCritDamageBonus?.level || 0) * 10;

        // Pet Effects
        const equippedPets = state.pets?.equipped || [];

        // Dragon Pet: Final Damage Multiplier
        let dragonMultiplier = 1;
        equippedPets.forEach(petId => {
            const [type, rarity] = petId.split('_');
            if (type === 'dragon') {
                const multipliers = { common: 1.05, rare: 1.1, epic: 1.2, legendary: 1.4, mythic: 2 };
                dragonMultiplier = Math.max(dragonMultiplier, multipliers[rarity] || 1);
            }
        });

        // Wolf Pet: Boss Damage (average 50% effectiveness for combat power)
        let wolfBonus = 0;
        equippedPets.forEach(petId => {
            const [type, rarity] = petId.split('_');
            if (type === 'wolf') {
                const bonuses = { common: 0.1, rare: 0.2, epic: 0.4, legendary: 0.8, mythic: 2 };
                wolfBonus = Math.max(wolfBonus, bonuses[rarity] || 0);
            }
        });
        const wolfMultiplier = 1 + (wolfBonus * 0.5); // 50% weight for combat power

        const baseDmg = state.clickDamage * (1 + attackBonus / 100);
        const critMultiplier = 1 + (state.criticalChance / 100) * ((state.criticalDamage + critDamageBonus) / 100);
        const hyperCritMultiplier = 1 + (state.hyperCriticalChance / 100) * ((state.hyperCriticalDamage + hyperCritDamageBonus) / 100);
        const megaCritMultiplier = 1 + (state.megaCriticalChance / 100) * ((state.megaCriticalDamage + megaCritDamageBonus) / 100);
        const gigaCritMultiplier = 1 + (state.gigaCriticalChance / 100) * (state.gigaCriticalDamage / 100);
        const teraCritMultiplier = 1 + (state.teraCriticalChance / 100) * (state.teraCriticalDamage / 100);
        const petaCritMultiplier = 1 + (state.petaCriticalChance / 100) * (state.petaCriticalDamage / 100);
        const exaCritMultiplier = 1 + (state.exaCriticalChance / 100) * (state.exaCriticalDamage / 100);
        const zettaCritMultiplier = 1 + (state.zettaCriticalChance / 100) * (state.zettaCriticalDamage / 100);
        const yottaCritMultiplier = 1 + (state.yottaCriticalChance / 100) * (state.yottaCriticalDamage / 100);
        const ronnaCritMultiplier = 1 + (state.ronnaCriticalChance / 100) * (state.ronnaCriticalDamage / 100);
        const quettaCritMultiplier = 1 + (state.quettaCriticalChance / 100) * (state.quettaCriticalDamage / 100);
        const xenoCritMultiplier = 1 + (state.xenoCriticalChance / 100) * (state.xenoCriticalDamage / 100);
        const ultimaCritMultiplier = 1 + (state.ultimaCriticalChance / 100) * (state.ultimaCriticalDamage / 100);
        const omniCritMultiplier = 1 + (state.omniCriticalChance / 100) * (state.omniCriticalDamage / 100);
        const absoluteCritMultiplier = 1 + (state.absoluteCriticalChance / 100) * (state.absoluteCriticalDamage / 100);

        return Math.floor(baseDmg * critMultiplier * hyperCritMultiplier * megaCritMultiplier * gigaCritMultiplier * teraCritMultiplier * petaCritMultiplier * exaCritMultiplier * zettaCritMultiplier * yottaCritMultiplier * ronnaCritMultiplier * quettaCritMultiplier * xenoCritMultiplier * ultimaCritMultiplier * omniCritMultiplier * absoluteCritMultiplier * dragonMultiplier * wolfMultiplier);
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, overflow: 'hidden' }}>
                        {/* Username & Ranking Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

                            {/* Stage Ranking */}
                            {stageRank !== null && (
                                <div style={{
                                    backgroundColor: 'rgba(255,215,0,0.2)',
                                    padding: '1px 5px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,215,0,0.4)',
                                    fontSize: '0.65rem',
                                    color: '#ffd700',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0
                                }}>
                                    {stageRank}위
                                </div>
                            )}
                        </div>

                        {/* Stats Row - All in one line */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'nowrap',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}>
                            {/* Combat Power */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontSize: '0.55rem',
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
                                fontSize: '0.55rem',
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
                                fontSize: '0.55rem',
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
                                        setShowSkins(true);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#9C27B0',
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
                                        e.target.style.backgroundColor = 'rgba(156,39,176,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <span>👔</span>
                                    <span>스킨</span>
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

            {/* Skin Modal */}
            {showSkins && (
                <SkinModal onClose={() => setShowSkins(false)} />
            )}
        </>
    );
};

export default HUD;
