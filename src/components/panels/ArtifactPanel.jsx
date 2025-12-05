import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

const ArtifactPanel = () => {
    const { state, dispatch } = useGame();
    const { artifacts, diamond, lastPullResults, currentStage } = state;

    // Check if artifacts are unlocked (stage 10-1+)
    const isUnlocked = currentStage.chapter > 10 || (currentStage.chapter === 10 && currentStage.stage >= 1);

    // Hold-to-repeat functionality
    const holdIntervalRef = useRef(null);
    const holdTimeoutRef = useRef(null);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const artifactTypes = [
        { id: 'attackBonus', name: '고대의 검', icon: '⚔️', desc: '공격력 증가', bonusPerLevel: 0.5, unit: '%' },
        { id: 'critDamageBonus', name: '암살자의 단검', icon: '🗡️', desc: '치명타 데미지 증가', bonusPerLevel: 10, unit: '%' },
        { id: 'moveSpeed', name: '헤르메스의 신발', icon: '👞', desc: '이동 속도 증가', bonusPerLevel: 0.005, unit: '' },
        { id: 'attackRange', name: '매의 눈', icon: '👁️', desc: '공격 범위 증가', bonusPerLevel: 0.04, unit: '' },
        { id: 'goldBonus', name: '황금 성배', icon: '🏆', desc: '골드 획득량 증가', bonusPerLevel: 0.5, unit: '%' }
    ];

    // Show lock screen if not unlocked
    if (!isUnlocked) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#888'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '10px' }}>
                    유물 시스템 잠금
                </div>
                <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
                    스테이지 <span style={{ color: '#FFD700', fontWeight: 'bold' }}>10-1</span>에 도달하면 해금됩니다
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    현재 스테이지: {currentStage.chapter}-{currentStage.stage}
                </div>
            </div>
        );
    }

    const handlePull = (count) => {
        const cost = count * 100; // 100 diamonds per pull
        if (diamond < cost) {
            alert('다이아가 부족합니다!');
            return;
        }
        dispatch({ type: 'PULL_ARTIFACT', payload: { count, cost } });
    };

    const handlePullAll = () => {
        const maxPulls = Math.floor(diamond / 100);
        if (maxPulls === 0) {
            alert('다이아가 부족합니다!');
            return;
        }
        const cost = maxPulls * 100;
        dispatch({ type: 'PULL_ARTIFACT', payload: { count: maxPulls, cost } });
    };

    const handleUpgrade = (type) => {
        const currentState = stateRef.current;
        const artifact = currentState.artifacts[type];

        if (artifact.count < 1) {
            stopHold();
            return;
        }
        dispatch({ type: 'UPGRADE_ARTIFACT', payload: { type } });
    };

    const handleSell = (type) => {
        const artifact = artifacts[type];

        if (artifact.level < 1000 || artifact.count < 1) {
            return;
        }

        const sellCount = artifact.count;
        const diamondGain = sellCount * 100;

        if (window.confirm(`${sellCount}개의 유물을 판매하여 💎${diamondGain}를 받으시겠습니까?`)) {
            dispatch({ type: 'SELL_ARTIFACT', payload: { type, count: sellCount } });
        }
    };

    const startHold = (action) => {
        // Execute immediately
        action();

        let currentInterval = 100;
        const minInterval = 20;
        const acceleration = 5;

        // Start repeating after 500ms delay
        holdTimeoutRef.current = setTimeout(() => {
            const repeatAction = () => {
                action();
                currentInterval = Math.max(minInterval, currentInterval - acceleration);
                holdIntervalRef.current = setTimeout(repeatAction, currentInterval);
            };
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

    const handleConfirmResult = () => {
        dispatch({ type: 'CLEAR_PULL_RESULTS' });
    };

    const isLocked = (condition) => {
        return false; // No locked artifacts for now
    };

    // Helper to get artifact info by ID
    const getArtifactInfo = (id) => artifactTypes.find(t => t.id === id);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            height: '100%',
            overflowY: 'auto',
            color: 'white',
            position: 'relative'
        }}>
            {/* Summon Result Modal */}
            {lastPullResults && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#1a1a2e',
                        border: '2px solid #FFD700',
                        borderRadius: '15px',
                        padding: '20px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#FFD700',
                            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                        }}>
                            소환 결과
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '15px',
                            width: '100%',
                            justifyContent: 'center'
                        }}>
                            {(() => {
                                // Group artifacts by type and count them
                                const grouped = {};
                                lastPullResults.forEach(artifactId => {
                                    grouped[artifactId] = (grouped[artifactId] || 0) + 1;
                                });

                                return Object.entries(grouped).map(([artifactId, count], index) => {
                                    const info = getArtifactInfo(artifactId);
                                    return (
                                        <div key={artifactId} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '5px',
                                            animation: `fadeIn 0.3s ease-out ${index * 0.1}s backwards`,
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2.5rem',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                boxShadow: '0 0 10px rgba(255,255,255,0.1)',
                                                position: 'relative'
                                            }}>
                                                {info?.icon}
                                                {count > 1 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-8px',
                                                        right: '-8px',
                                                        backgroundColor: '#FF5722',
                                                        color: 'white',
                                                        borderRadius: '12px',
                                                        padding: '3px 8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        border: '2px solid white',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}>
                                                        x{count}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#FFD700',
                                                textAlign: 'center',
                                                maxWidth: '80px'
                                            }}>
                                                {info?.name}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        <button
                            onClick={handleConfirmResult}
                            style={{
                                padding: '10px 40px',
                                backgroundColor: '#4CAF50',
                                border: 'none',
                                borderRadius: '25px',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* Gacha Section */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '15px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                    유물 소환
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => handlePull(1)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: diamond >= 100 ? '#4CAF50' : '#555',
                            border: 'none',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: diamond >= 100 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>1회 소환</span>
                        <span style={{ fontSize: '0.8rem' }}>💎 100</span>
                    </button>
                    <button
                        onClick={() => handlePull(10)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: diamond >= 1000 ? '#2196F3' : '#555',
                            border: 'none',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: diamond >= 1000 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>10회 소환</span>
                        <span style={{ fontSize: '0.8rem' }}>💎 1,000</span>
                    </button>
                    <button
                        onClick={handlePullAll}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: diamond >= 100 ? '#FF9800' : '#555',
                            border: 'none',
                            borderRadius: '5px',
                            color: 'white',
                            cursor: diamond >= 100 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <span>전체 소환</span>
                        <span style={{ fontSize: '0.8rem' }}>💎 {Math.floor(diamond / 100) * 100}</span>
                    </button>
                </div>
            </div>

            {/* Artifact List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {artifactTypes.map((type) => {
                    const artifact = artifacts[type.id];
                    const locked = isLocked(type.condition);
                    const successChance = Math.max(0, 100 - (artifact.level * 0.05)).toFixed(2);

                    return (
                        <div key={type.id} style={{
                            backgroundColor: locked ? 'rgba(50,50,50,0.5)' : 'rgba(0,0,0,0.6)',
                            padding: '10px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: locked ? 0.7 : 1,
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ fontSize: '2rem' }}>{locked ? '🔒' : type.icon}</div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: locked ? '#aaa' : '#fff' }}>
                                    {type.name} <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>Lv.{artifact.level}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                                    {type.desc}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#4CAF50' }}>
                                    현재 효과: +{(artifact.level * type.bonusPerLevel).toFixed(type.unit === '%' ? 1 : 2)}{type.unit}
                                </div>
                            </div>

                            {!locked && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {artifact.count} / 1
                                    </div>
                                    <button
                                        onMouseDown={() => startHold(() => handleUpgrade(type.id))}
                                        onMouseUp={stopHold}
                                        onMouseLeave={stopHold}
                                        onTouchStart={() => startHold(() => handleUpgrade(type.id))}
                                        onTouchEnd={stopHold}
                                        disabled={artifact.count < 1 || artifact.level >= 1000}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: artifact.level >= 1000 ? '#666' : (artifact.count >= 1 ? '#FF9800' : '#555'),
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: 'white',
                                            cursor: (artifact.count >= 1 && artifact.level < 1000) ? 'pointer' : 'not-allowed',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {artifact.level >= 1000 ? '최대 레벨' : `강화 (${successChance}%)`}
                                    </button>
                                    {artifact.level >= 1000 && artifact.count > 0 && (
                                        <button
                                            onClick={() => handleSell(type.id)}
                                            style={{
                                                padding: '5px 10px',
                                                backgroundColor: '#4CAF50',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                marginTop: '3px'
                                            }}
                                        >
                                            판매 (💎{artifact.count * 100})
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ArtifactPanel;
