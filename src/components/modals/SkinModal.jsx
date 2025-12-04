import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

const SkinModal = ({ onClose }) => {
    const { state, dispatch } = useGame();
    const { skins, diamond, lastPullResults } = state;
    const [showProbability, setShowProbability] = useState(false);

    // Rarity = Job mapping
    const rarityInfo = {
        common: { name: '채집가', color: '#888', emoji: '🧺', icon: '🧺', score: 1 },
        rare: { name: '포자술사', color: '#00BCD4', emoji: '🍄', icon: '🍄', score: 2 },
        epic: { name: '독버섯 암살자', color: '#9C27B0', emoji: '🗡️', icon: '🗡️', score: 3 },
        legendary: { name: '드루이드', color: '#FF9800', emoji: '🍃', icon: '🍃', score: 4 },
        mythic: { name: '버섯 군주', color: '#F44336', emoji: '👑', icon: '👑', score: 5 }
    };

    const gradeInfo = {
        1: { name: '1등급', score: 4 },
        2: { name: '2등급', score: 3 },
        3: { name: '3등급', score: 2 },
        4: { name: '4등급', score: 1 }
    };

    // Get skin effect value (attack bonus)
    const getSkinEffect = (rarity, grade) => {
        const effects = {
            common: { 1: 5, 2: 3, 3: 2, 4: 1 },
            rare: { 1: 15, 2: 12, 3: 10, 4: 8 },
            epic: { 1: 40, 2: 30, 3: 25, 4: 20 },
            legendary: { 1: 80, 2: 70, 3: 60, 4: 50 },
            mythic: { 1: 300, 2: 200, 3: 150, 4: 100 }
        };
        return effects[rarity]?.[grade] || 0;
    };

    const getSkinSortScore = (skinId) => {
        const parts = skinId.split('_');
        if (parts.length !== 3) return 0;
        const rarity = parts[1];
        const grade = parseInt(parts[2]);
        const rarityScore = rarityInfo[rarity]?.score || 0;
        const gradeScore = gradeInfo[grade]?.score || 0;
        return (rarityScore * 10) + gradeScore;
    };

    const handlePull = (count) => {
        const cost = count * 200;
        if (diamond < cost) {
            alert('다이아가 부족합니다!');
            return;
        }
        dispatch({ type: 'PULL_SKIN', payload: { count, cost } });
    };

    const handlePullAll = () => {
        const maxPulls = Math.floor(diamond / 200);
        if (maxPulls === 0) {
            alert('다이아가 부족합니다!');
            return;
        }
        const cost = maxPulls * 200;
        dispatch({ type: 'PULL_SKIN', payload: { count: maxPulls, cost } });
    };

    const handleMerge = (skinId) => {
        dispatch({ type: 'MERGE_SKIN', payload: { skinId } });
    };

    const handleMergeAll = () => {
        dispatch({ type: 'MERGE_ALL_SKINS' });
    };

    const handleEquip = (skinId) => {
        if (skins.equipped === skinId) {
            dispatch({ type: 'UNEQUIP_SKIN' });
        } else {
            dispatch({ type: 'EQUIP_SKIN', payload: { skinId } });
        }
    };

    const handleConfirmResult = () => {
        dispatch({ type: 'CLEAR_PULL_RESULTS' });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#1a1a2e',
                border: '2px solid #9C27B0',
                borderRadius: '15px',
                padding: '20px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#9C27B0' }}>
                            👔 스킨 관리
                        </div>
                        <button
                            onClick={() => setShowProbability(true)}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: '#ccc',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ?
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Probability Modal */}
                {showProbability && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 3000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(3px)'
                    }} onClick={() => setShowProbability(false)}>
                        <div style={{
                            backgroundColor: '#1a1a2e',
                            border: '2px solid #9C27B0',
                            borderRadius: '15px',
                            padding: '20px',
                            width: '85%',
                            maxWidth: '400px',
                            position: 'relative'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#9C27B0', marginBottom: '15px', textAlign: 'center' }}>
                                📊 소환 확률
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '15px', textAlign: 'center' }}>
                                등급 확률 (대분류)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F44336', fontWeight: 'bold' }}>
                                    <span>👑 버섯 군주 (신화)</span>
                                    <span>0.1%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FF9800', fontWeight: 'bold' }}>
                                    <span>🍃 드루이드 (전설)</span>
                                    <span>1.0%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9C27B0', fontWeight: 'bold' }}>
                                    <span>🗡️ 독버섯 암살자 (영웅)</span>
                                    <span>5.0%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00BCD4', fontWeight: 'bold' }}>
                                    <span>🍄 포자술사 (희귀)</span>
                                    <span>10.0%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 'bold' }}>
                                    <span>🧺 채집가 (일반)</span>
                                    <span>83.9%</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '10px', textAlign: 'center' }}>
                                세부 등급 확률 (소분류)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFD700', fontSize: '0.9rem' }}>
                                    <span>⭐ 1등급</span>
                                    <span>10%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem' }}>
                                    <span>⭐ 2등급</span>
                                    <span>20%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem' }}>
                                    <span>⭐ 3등급</span>
                                    <span>30%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem' }}>
                                    <span>⭐ 4등급</span>
                                    <span>40%</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProbability(false)}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#555',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                )}

                {/* Summon Result Modal */}
                {lastPullResults && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 3000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            backgroundColor: '#1a1a2e',
                            border: '2px solid #9C27B0',
                            borderRadius: '15px',
                            padding: '20px',
                            width: '90%',
                            maxWidth: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: '70vh'
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9C27B0', marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
                                소환 결과
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '15px',
                                justifyContent: 'center',
                                overflowY: 'auto',
                                padding: '10px',
                                flex: '1 1 auto',
                                minHeight: 0
                            }}>
                                {(() => {
                                    const grouped = {};
                                    lastPullResults.forEach(skinId => {
                                        grouped[skinId] = (grouped[skinId] || 0) + 1;
                                    });

                                    return Object.entries(grouped)
                                        .sort(([idA], [idB]) => getSkinSortScore(idB) - getSkinSortScore(idA))
                                        .map(([skinId, count]) => {
                                            const parts = skinId.split('_');
                                            if (parts.length !== 3) return null;
                                            const rarity = parts[1];
                                            const grade = parseInt(parts[2]);
                                            const rarityData = rarityInfo[rarity];

                                            return (
                                                <div key={skinId} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '5px'
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
                                                        border: `2px solid ${rarityData.color}`,
                                                        position: 'relative'
                                                    }}>
                                                        {rarityData.icon}
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
                                                                border: '2px solid white'
                                                            }}>
                                                                x{count}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: rarityData.color, textAlign: 'center' }}>
                                                        {rarityData.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: '#FFD700', textAlign: 'center' }}>
                                                        {grade}등급
                                                    </div>
                                                </div>
                                            );
                                        });
                                })()}
                            </div>
                            <button
                                onClick={handleConfirmResult}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#4CAF50',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                )}

                {/* Content - Scrollable */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    color: 'white'
                }}>
                    {/* Gacha Section */}
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: '15px',
                        borderRadius: '10px'
                    }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#9C27B0', marginBottom: '10px' }}>
                            스킨 소환
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handlePull(1)}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: diamond >= 200 ? '#4CAF50' : '#555',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: diamond >= 200 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <span>1회 소환</span>
                                <span style={{ fontSize: '0.8rem' }}>💎 200</span>
                            </button>
                            <button
                                onClick={() => handlePull(10)}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: diamond >= 2000 ? '#2196F3' : '#555',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: diamond >= 2000 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <span>10회 소환</span>
                                <span style={{ fontSize: '0.8rem' }}>💎 2,000</span>
                            </button>
                            <button
                                onClick={handlePullAll}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    backgroundColor: diamond >= 200 ? '#FF9800' : '#555',
                                    border: 'none',
                                    borderRadius: '5px',
                                    color: 'white',
                                    cursor: diamond >= 200 ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <span>모두 소환</span>
                                <span style={{ fontSize: '0.8rem' }}>💎 {Math.floor(diamond / 200) * 200}</span>
                            </button>
                        </div>
                    </div>

                    {/* Merge All Button */}
                    <button
                        onClick={handleMergeAll}
                        style={{
                            padding: '12px',
                            backgroundColor: '#9C27B0',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 모두 합성
                    </button>

                    {/* Equipped Skin Section */}
                    {skins.equipped && (
                        <div style={{
                            backgroundColor: 'rgba(156,39,176,0.2)',
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(156,39,176,0.5)'
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#9C27B0', marginBottom: '10px' }}>
                                장착 중인 스킨
                            </div>
                            {(() => {
                                const parts = skins.equipped.split('_');
                                if (parts.length !== 3) return null;
                                const rarity = parts[1];
                                const grade = parseInt(parts[2]);
                                const rarityData = rarityInfo[rarity];
                                const effect = getSkinEffect(rarity, grade);

                                return (
                                    <div style={{
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `2px solid ${rarityData.color}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div style={{ fontSize: '3rem' }}>{rarityData.icon}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', color: rarityData.color, fontWeight: 'bold' }}>
                                                {rarityData.emoji} {rarityData.name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#FFD700' }}>
                                                {grade}등급
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#FFD700', marginTop: '3px' }}>
                                                ⚔️ 공격력 +{effect}%
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEquip(skins.equipped)}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#F44336',
                                                border: 'none',
                                                borderRadius: '5px',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            해제
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Skin Inventory */}
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                        보유 스킨 ({Object.keys(skins.inventory).filter(id => skins.inventory[id] > 0).length}종)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                        {Object.entries(skins.inventory)
                            .sort(([idA], [idB]) => getSkinSortScore(idB) - getSkinSortScore(idA))
                            .map(([skinId, count]) => {
                                if (count === 0) return null;

                                const parts = skinId.split('_');
                                if (parts.length !== 3) return null;
                                const rarity = parts[1];
                                const grade = parseInt(parts[2]);
                                const rarityData = rarityInfo[rarity];
                                const isEquipped = skins.equipped === skinId;
                                const canMerge = count >= 5 && !(rarity === 'mythic' && grade === 1);
                                const effect = getSkinEffect(rarity, grade);

                                return (
                                    <div key={skinId} style={{
                                        backgroundColor: isEquipped ? 'rgba(156,39,176,0.2)' : 'rgba(0,0,0,0.6)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `2px solid ${isEquipped ? '#9C27B0' : rarityData.color}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '5px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ fontSize: '2.5rem' }}>{rarityData.icon}</div>
                                        <div style={{ fontSize: '0.75rem', color: rarityData.color, fontWeight: 'bold', textAlign: 'center' }}>
                                            {rarityData.emoji} {rarityData.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#FFD700', textAlign: 'center' }}>
                                            {grade}등급
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: '#FFD700', textAlign: 'center' }}>
                                            ⚔️ +{effect}%
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>
                                            보유: {count}개
                                        </div>
                                        <button
                                            onClick={() => handleEquip(skinId)}
                                            disabled={!isEquipped && count < 1}
                                            style={{
                                                width: '100%',
                                                padding: '5px',
                                                backgroundColor: isEquipped ? '#F44336' : '#4CAF50',
                                                border: 'none',
                                                borderRadius: '4px',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isEquipped ? '해제' : '장착'}
                                        </button>
                                        {canMerge && (
                                            <button
                                                onClick={() => handleMerge(skinId)}
                                                style={{
                                                    width: '100%',
                                                    padding: '5px',
                                                    backgroundColor: '#9C27B0',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                합성 (5→1)
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

                    {Object.keys(skins.inventory).filter(id => skins.inventory[id] > 0).length === 0 && (
                        <div style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>
                            보유한 스킨이 없습니다. 소환해보세요!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkinModal;
