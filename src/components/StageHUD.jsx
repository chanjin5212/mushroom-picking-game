import React from 'react';

const StageHUD = ({ currentStage, mushroomsCollected, bossTimer, bossPhase, onNextStage, onBossChallenge, onToggleAutoProgress, autoProgress, bossHp, bossMaxHp }) => {
    const { chapter, stage } = currentStage;
    const isBossStage = stage === 10;
    // X-10 stages: show normal counter until boss phase
    const showBossUI = isBossStage && bossPhase;
    const isCompleted = showBossUI ? false : mushroomsCollected >= 100;
    const canChallengeBoss = isBossStage && !bossPhase && mushroomsCollected >= 100;

    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            zIndex: 500,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
            {/* Top Row: Stage Info + Auto Toggle + Action Button */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                gap: '8px'
            }}>
                {/* Stage Info */}
                <div style={{
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                }}>
                    <span>스테이지 {chapter}-{stage}</span>
                    {isBossStage && <span style={{ color: '#ff4444', fontSize: '0.75rem' }}>{bossPhase ? '🔥' : '⚔️'}</span>}
                </div>

                {/* Auto-Progress Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    opacity: 0.8
                }} onClick={onToggleAutoProgress}>
                    <input
                        type="checkbox"
                        checked={autoProgress}
                        onChange={onToggleAutoProgress}
                        style={{ cursor: 'pointer', width: '12px', height: '12px' }}
                    />
                    <span style={{ color: 'white', fontSize: '0.7rem' }}>자동</span>
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
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
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
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            다음
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Counters / Boss Stats */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
                {showBossUI ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Boss HP Bar */}
                        <div style={{
                            width: '120px',
                            height: '10px',
                            backgroundColor: '#333',
                            borderRadius: '5px',
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
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            minWidth: '25px',
                            textAlign: 'center'
                        }}>
                            {bossTimer}s
                        </div>
                    </div>
                ) : (
                    <div style={{
                        color: isCompleted ? '#4caf50' : 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>🍄</span>
                        <span>{mushroomsCollected} / 100</span>
                    </div>
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
        </div>
    );
};

export default StageHUD;
