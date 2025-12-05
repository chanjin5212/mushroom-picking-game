import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';

const PetPanel = () => {
    const { state, dispatch } = useGame();
    const { pets, diamond, lastPullResults, currentStage } = state;
    const [showProbability, setShowProbability] = useState(false);

    // Check if pets are unlocked (stage 50-1+)
    const isUnlocked = currentStage.chapter > 50 || (currentStage.chapter === 50 && currentStage.stage >= 1);

    const petInfo = {
        slime: { name: '슬라임', icon: '🟢', effect: '골드' },
        wolf: { name: '늑대', icon: '🐺', effect: '보스뎀' },
        eagle: { name: '독수리', icon: '🦅', effect: '희귀버섯' },
        dragon: { name: '드래곤', icon: '🐉', effect: '최종뎀' },
        fairy: { name: '요정', icon: '🧚', effect: '다이아' }
    };

    const rarityInfo = {
        common: { name: '일반', color: '#888', emoji: '⚪', score: 1 },
        rare: { name: '희귀', color: '#00BCD4', emoji: '🔵', score: 2 },
        epic: { name: '영웅', color: '#9C27B0', emoji: '🟣', score: 3 },
        legendary: { name: '전설', color: '#FF9800', emoji: '🟡', score: 4 },
        mythic: { name: '신화', color: '#F44336', emoji: '🔴', score: 5 }
    };

    const typeOrder = {
        dragon: 5,
        wolf: 4,
        eagle: 3,
        slime: 2,
        fairy: 1
    };

    const getPetSortScore = (petId) => {
        const [type, rarity] = petId.split('_');
        const rarityScore = rarityInfo[rarity]?.score || 0;
        const typeScore = typeOrder[type] || 0;
        return (rarityScore * 10) + typeScore;
    };

    const getPetEffectDescription = (type, rarity) => {
        const effectValues = {
            slime: { common: 10, rare: 20, epic: 40, legendary: 80, mythic: 200 },
            wolf: { common: 10, rare: 20, epic: 40, legendary: 80, mythic: 200 },
            eagle: { common: 10, rare: 30, epic: 60, legendary: 100, mythic: 200 },
            dragon: { common: 5, rare: 10, epic: 20, legendary: 40, mythic: 100 },
            fairy: { common: 0.01, rare: 0.02, epic: 0.05, legendary: 0.1, mythic: 0.2 }
        };

        const value = effectValues[type]?.[rarity] || 0;
        return `+${value}%`;
    };

    const handlePull = (count) => {
        const cost = count * 200;
        if (diamond < cost) {
            alert('다이아가 부족합니다!');
            return;
        }
        dispatch({ type: 'PULL_PET', payload: { count, cost } });
    };

    const handlePullAll = () => {
        const maxPulls = Math.floor(diamond / 200);
        if (maxPulls === 0) {
            alert('다이아가 부족합니다!');
            return;
        }
        const cost = maxPulls * 200;
        dispatch({ type: 'PULL_PET', payload: { count: maxPulls, cost } });
    };

    const handleMerge = (petId) => {
        dispatch({ type: 'MERGE_PET', payload: { petId } });
    };

    const handleMergeAll = () => {
        // Find all pets that can be merged (count >= 5 and not mythic)
        const mergeable = Object.entries(pets.inventory)
            .filter(([petId, count]) => {
                const [, rarity] = petId.split('_');
                return count >= 5 && rarity !== 'mythic';
            });

        if (mergeable.length === 0) {
            alert('합성 가능한 펛이 없습니다!');
            return;
        }

        // Merge all mergeable pets
        mergeable.forEach(([petId]) => {
            dispatch({ type: 'MERGE_PET', payload: { petId } });
        });
    };

    const handleEquip = (petId) => {
        if (pets.equipped.includes(petId)) {
            dispatch({ type: 'UNEQUIP_PET', payload: { petId } });
        } else {
            // Check if slots are full
            if (pets.equipped.length >= pets.unlockedSlots) {
                alert(`펫 장착 슬롯이 가득 찼습니다! (${pets.unlockedSlots}/${pets.unlockedSlots})`);
                return;
            }
            dispatch({ type: 'EQUIP_PET', payload: { petId } });
        }
    };

    const handleConfirmResult = () => {
        dispatch({ type: 'CLEAR_PULL_RESULTS' });
    };

    if (!isUnlocked) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#888'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '10px' }}>
                    펫 시스템 잠금
                </div>
                <div style={{ fontSize: '1rem', marginBottom: '5px' }}>
                    스테이지 <span style={{ color: '#FFD700', fontWeight: 'bold' }}>50-1</span>에 도달하면 해금됩니다
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    현재 스테이지: {currentStage.chapter}-{currentStage.stage}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px',
            height: '100%',
            overflowY: 'auto',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700' }}>
                        🐾 펫 관리
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
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(3px)'
                }} onClick={() => setShowProbability(false)}>
                    <div style={{
                        backgroundColor: '#1a1a2e',
                        border: '2px solid #FFD700',
                        borderRadius: '15px',
                        padding: '20px',
                        width: '85%',
                        maxWidth: '350px',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '15px', textAlign: 'center' }}>
                            📊 소환 확률
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F44336', fontWeight: 'bold' }}>
                                <span>🔴 신화 (Mythic)</span>
                                <span>0.1%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FF9800', fontWeight: 'bold' }}>
                                <span>🟡 전설 (Legendary)</span>
                                <span>1.0%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9C27B0', fontWeight: 'bold' }}>
                                <span>🟣 영웅 (Epic)</span>
                                <span>5.0%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00BCD4', fontWeight: 'bold' }}>
                                <span>🔵 희귀 (Rare)</span>
                                <span>10.0%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontWeight: 'bold' }}>
                                <span>⚪ 일반 (Common)</span>
                                <span>83.9%</span>
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
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '80vh'
                    }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
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
                                lastPullResults.forEach(petId => {
                                    grouped[petId] = (grouped[petId] || 0) + 1;
                                });

                                return Object.entries(grouped)
                                    .sort(([idA], [idB]) => getPetSortScore(idB) - getPetSortScore(idA))
                                    .map(([petId, count]) => {
                                        const [type, rarity] = petId.split('_');
                                        const pet = petInfo[type];
                                        const rarityData = rarityInfo[rarity];

                                        return (
                                            <div key={petId} style={{
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
                                                    {pet.icon}
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
                                                <div style={{ fontSize: '0.75rem', color: rarityData.color, textAlign: 'center' }}>
                                                    {rarityData.name} {pet.name}
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

            {/* Gacha Section */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '10px'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '10px' }}>
                    펫 소환
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

            {/* Equipped Pets Section */}
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '10px'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                    장착 중인 펫 ({pets.equipped.length}/{pets.unlockedSlots})
                </div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                    {Array.from({ length: pets.unlockedSlots }).map((_, index) => {
                        const petId = pets.equipped[index];

                        if (!petId) {
                            // Empty slot
                            return (
                                <div key={index} style={{
                                    flex: 1,
                                    minWidth: 0,
                                    height: '120px',
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    빈 슬롯
                                </div>
                            );
                        }

                        const [type, rarity] = petId.split('_');
                        const pet = petInfo[type];
                        const rarityData = rarityInfo[rarity];

                        return (
                            <div key={index} style={{
                                flex: 1,
                                minWidth: 0,
                                backgroundColor: 'rgba(76,175,80,0.2)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `2px solid ${rarityData.color}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '2rem' }}>{pet.icon}</div>
                                <div style={{ fontSize: '0.7rem', color: rarityData.color, fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {rarityData.emoji} {rarityData.name}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: '#ccc', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    {pet.name}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: '#FFD700', textAlign: 'center', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                    {pet.effect} {getPetEffectDescription(type, rarity)}
                                </div>
                                <button
                                    onClick={() => handleEquip(petId)}
                                    style={{
                                        width: '100%',
                                        padding: '4px',
                                        backgroundColor: '#F44336',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        marginTop: 'auto',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    해제
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Active Pet Effects Section */}
            {pets.equipped.length > 0 && (
                <div style={{
                    backgroundColor: 'rgba(255,215,0,0.1)',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    border: '1px solid rgba(255,215,0,0.3)'
                }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFD700', marginBottom: '10px' }}>
                        🌟 활성화된 펫 효과
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pets.equipped.map((petId, index) => {
                            const [type, rarity] = petId.split('_');
                            const pet = petInfo[type];
                            const rarityData = rarityInfo[rarity];
                            const effectValue = getPetEffectDescription(type, rarity);

                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${rarityData.color}`
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{pet.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', color: rarityData.color, fontWeight: 'bold' }}>
                                            {rarityData.emoji} {rarityData.name} {pet.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#FFD700', marginTop: '2px' }}>
                                            {pet.effect === '골드' && `💰 골드 획득량 ${effectValue} 증가`}
                                            {pet.effect === '보스뎀' && `⚔️ 보스 데미지 ${effectValue} 증가`}
                                            {pet.effect === '희귀버섯' && `🍄 희귀 버섯 출현율 ${effectValue} 증가`}
                                            {pet.effect === '최종뎀' && `💥 최종 데미지 ${effectValue} 증가`}
                                            {pet.effect === '다이아' && `💎 다이아 10개 드롭 확률 ${effectValue}`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Pet Inventory */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    보유 펫 ({Object.keys(pets.inventory).length}종)
                </div>
                <button
                    onClick={handleMergeAll}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#9C27B0',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    모두 합성
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                {Object.entries(pets.inventory)
                    .sort(([idA], [idB]) => getPetSortScore(idB) - getPetSortScore(idA))
                    .map(([petId, count]) => {
                        if (count === 0) return null;

                        const [type, rarity] = petId.split('_');
                        const pet = petInfo[type];
                        const rarityData = rarityInfo[rarity];
                        const isEquipped = pets.equipped.includes(petId);
                        const canMerge = count >= 5 && rarity !== 'mythic';

                        return (
                            <div key={petId} style={{
                                backgroundColor: isEquipped ? 'rgba(76,175,80,0.2)' : 'rgba(0,0,0,0.6)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: `2px solid ${isEquipped ? '#4CAF50' : rarityData.color}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '5px',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '2.5rem' }}>{pet.icon}</div>
                                <div style={{ fontSize: '0.8rem', color: rarityData.color, fontWeight: 'bold' }}>
                                    {rarityData.emoji} {rarityData.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#ccc' }}>
                                    {pet.name} ({pet.effect})
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    보유: {count}개
                                </div>
                                <button
                                    onClick={() => handleEquip(petId)}
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
                                        onClick={() => handleMerge(petId)}
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

            {Object.keys(pets.inventory).length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>
                    보유한 펫이 없습니다. 소환해보세요!
                </div>
            )}
        </div>
    );
};

export default PetPanel;
