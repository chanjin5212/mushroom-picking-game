import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import WorldBossRankingModal from './WorldBossRankingModal';

const WorldBossModal = () => {
    const { state, dispatch } = useGame();
    const { worldBoss } = state;
    const [showRanking, setShowRanking] = useState(false);

    if (!worldBoss.isActive) return null;

    const handleEnter = () => {
        dispatch({ type: 'CLOSE_WORLD_BOSS' });
        dispatch({ type: 'START_BOSS_BATTLE' });
    };

    const handleClose = () => {
        dispatch({ type: 'CLOSE_WORLD_BOSS' });
    };

    return (
        <>
            {showRanking && <WorldBossRankingModal onClose={() => setShowRanking(false)} />}

            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000
            }}>
                <div style={{
                    background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                    border: '2px solid #FFD700',
                    borderRadius: '20px',
                    padding: '30px',
                    width: '90%',
                    maxWidth: '450px',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    position: 'relative',
                    color: 'white'
                }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingBottom: '15px'
                    }}>
                        <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#FFD700',
                            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                        }}>
                            월드보스
                        </div>
                        <button
                            onClick={() => setShowRanking(true)}
                            style={{
                                background: 'rgba(255, 215, 0, 0.2)',
                                border: '1px solid #FFD700',
                                color: '#FFD700',
                                padding: '8px 15px',
                                borderRadius: '15px',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            🏆 랭킹 보기
                        </button>
                    </div>

                    {/* Boss Image */}
                    <div style={{
                        height: '200px',
                        background: 'linear-gradient(to bottom, #2c3e50, #000)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Giant Mushroom Boss */}
                        <div style={{
                            fontSize: '8rem',
                            filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            🍄
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            width: '100%',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.8rem'
                        }}>
                            ⚔️ BATTLE ZONE ⚔️
                        </div>
                    </div>

                    {/* Boss Info */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '1.5rem',
                            color: '#ff4444',
                            fontWeight: 'bold',
                            marginBottom: '5px',
                            textShadow: '0 0 10px rgba(255, 0, 0, 0.3)'
                        }}>
                            거대 버섯 군주
                        </div>
                        <div style={{ fontSize: '1.1rem', marginBottom: '5px' }}>
                            보스를 함께 해치우세요!
                        </div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>
                            60초 동안 데미지를 입히고 골드를 획득하세요!<br />
                            <span style={{ color: '#FFD700' }}>내 최고 기록: {(worldBoss.maxDamage || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                backgroundColor: '#444',
                                color: '#ccc'
                            }}
                        >
                            닫기
                        </button>
                        <button
                            onClick={handleEnter}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                color: '#000',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)'
                            }}
                        >
                            입장하기
                        </button>
                    </div>
                </div>
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}</style>
            </div>
        </>
    );
};

export default WorldBossModal;
