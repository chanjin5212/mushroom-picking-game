import React from 'react';
import { formatNumber } from '../../utils/formatNumber';
import { initialState, SAVE_KEY, BALANCE } from '../../data/constants';

const StageHUD = ({ currentStage, mushroomsCollected, bossTimer, bossPhase, onNextStage, onBossChallenge, onToggleAutoProgress, autoProgress, bossHp, bossMaxHp, onOpenStageSelect }) => {
    const { chapter, stage } = currentStage;
    const isBossStage = stage === 10;
    // X-10 stages: show normal counter until boss phase
    const showBossUI = isBossStage && bossPhase;
    const isCompleted = showBossUI ? false : mushroomsCollected >= 100;
    const canChallengeBoss = isBossStage && !bossPhase && mushroomsCollected >= 100;

    // Calculate normal mushroom stats
    const difficultyLevel = (chapter - 1) * 10 + stage;
    const normalHp = Math.floor(Math.pow(10, difficultyLevel * BALANCE.HP_EXPONENT) * 100);
    const normalReward = Math.floor(Math.pow(10, difficultyLevel * BALANCE.GOLD_EXPONENT) * 50);

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            zIndex: 500,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
            {/* Row 1: Stage Info */}
            <div style={{
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                paddingBottom: '4px',
                width: '100%',
                justifyContent: 'center'
            }}>
                <span>스테이지 {chapter}-{stage}</span>
                {/* Stage Select Button */}
                <button
                    onClick={onOpenStageSelect}
                    style={{
                        background: 'linear-gradient(90deg, #2196f3, #1976d2)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.5)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 3px 6px rgba(33,150,243,0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    }}
                    title="스테이지 선택"
                >
                    »
                </button>
            </div>

            {/* Row 2: Controls (Auto + Buttons) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%'
            }}>
                {/* Auto-Progress Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    opacity: 0.9,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                }} onClick={onToggleAutoProgress}>
                    <input
                        type="checkbox"
                        checked={autoProgress}
                        onChange={onToggleAutoProgress}
                        style={{ cursor: 'pointer', width: '10px', height: '10px' }}
                    />
                    <span style={{ color: 'white', fontSize: '0.65rem' }}>자동</span>
                </div>

                {/* Action Buttons */}
                <div>
                    {canChallengeBoss && onBossChallenge && (
                        <button
                            onClick={onBossChallenge}
                            style={{
                                backgroundColor: '#ff4444',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid white',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            도전
                        </button>
                    )}
                    {isCompleted && !isBossStage && onNextStage && (
                        <button
                            onClick={onNextStage}
                            style={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid white',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            다음
                        </button>
                    )}
                </div>
            </div>

            {/* Row 3: Counters / Boss Stats */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                {showBossUI ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Boss HP Bar */}
                        <div style={{
                            width: '100px',
                            height: '8px',
                            backgroundColor: '#333',
                            borderRadius: '4px',
                            border: '1px solid white',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: `${(bossHp / bossMaxHp) * 100}%`,
                                height: '100%',
                                backgroundColor: '#9C27B0',
                                transition: 'width 0.2s'
                            }} />
                        </div>
                        {/* Timer */}
                        <div style={{
                            color: bossTimer <= 10 ? '#ff4444' : 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            minWidth: '20px',
                            textAlign: 'center'
                        }}>
                            {bossTimer}s
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Mushroom Counter */}
                        <div style={{
                            color: isCompleted ? '#4caf50' : 'white',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span>🍄</span>
                            <span>{mushroomsCollected} / 100</span>
                        </div>

                        {/* Stats Info */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            fontSize: '0.6rem',
                            color: '#aaa'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                ❤️ {formatNumber(normalHp)}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                💰 {formatNumber(normalReward)}
                            </span>
                        </div>
                    </>
                )}
            </div>
            {/* Styles for animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div >
    );
};

export default StageHUD;
