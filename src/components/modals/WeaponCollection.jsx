import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

// 100 different mushroom types
const MUSHROOM_NAMES = [
    '팽이버섯', '느타리버섯', '표고버섯', '송이버섯', '양송이버섯',
    '목이버섯', '석이버섯', '영지버섯', '상황버섯', '동충하초',
    '싸리버섯', '꽃송이버섯', '노루궁뎅이버섯', '차가버섯', '아가리쿠스버섯',
    '새송이버섯', '만가닥버섯', '잎새버섯', '능이버섯', '복령버섯',
    '독버섯', '광대버섯', '붉은버섯', '파란버섯', '보라버섯',
    '황금버섯', '은빛버섯', '청동버섯', '철버섯', '강철버섯',
    '동굴버섯', '심해버섯', '화산버섯', '용암버섯', '얼음버섯',
    '눈꽃버섯', '수정버섯', '다이아버섯', '루비버섯', '사파이어버섯',
    '에메랄드버섯', '자수정버섯', '호박버섯', '진주버섯', '산호버섯',
    '산악버섯', '고산버섯', '평원버섯', '사막버섯', '정글버섯',
    '늪지버섯', '숲속버섯', '초원버섯', '설원버섯', '화염버섯',
    '번개버섯', '천둥버섯', '폭풍버섯', '태풍버섯', '지진버섯',
    '해일버섯', '토네이도버섯', '블리자드버섯', '유성버섯', '혜성버섯',
    '별빛버섯', '달빛버섯', '햇빛버섯', '무지개버섯', '오로라버섯',
    '심연버섯', '어둠버섯', '그림자버섯', '공허버섯', '혼돈버섯',
    '타락버섯', '저주버섯', '악마버섯', '천사버섯', '신성버섯',
    '고대버섯', '태초버섯', '원시버섯', '전설버섯', '신화버섯',
    '영웅버섯', '왕의버섯', '황제버섯', '제왕버섯', '패왕버섯',
    '용의버섯', '불사조버섯', '기린버섯', '현무버섯', '백호버섯',
    '청룡버섯', '주작버섯', '천마버섯', '신수버섯', '성수버섯',
    '거대버섯', '초거대버섯', '극대버섯', '무한버섯', '영원버섯'
];

const WeaponCollection = ({ onClose }) => {
    const { state, WEAPONS, dispatch } = useGame();
    const [activeTab, setActiveTab] = useState('weapons'); // 'weapons' or 'mushrooms'

    // Calculate mushroom collection stats
    const calculateMushroomStats = () => {
        let collected = 0;
        const total = 400; // 100 types × 4 rarities

        MUSHROOM_NAMES.forEach(name => {
            const collection = state.mushroomCollection[name];
            if (collection) {
                if (collection.normal) collected++;
                if (collection.rare) collected++;
                if (collection.epic) collected++;
                if (collection.unique) collected++;
            }
        });

        return { collected, total };
    };

    const mushroomStats = calculateMushroomStats();

    // Get rarity color
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'rare': return '#00BCD4'; // Cyan
            case 'epic': return '#9C27B0'; // Purple
            case 'unique': return '#FFD700'; // Gold
            default: return '#4CAF50'; // Green
        }
    };

    // Calculate total unclaimed rewards
    const calculateUnclaimedRewards = () => {
        let total = 0;

        // Unclaimed weapon rewards
        state.obtainedWeapons.forEach(weaponId => {
            if (!state.claimedRewards.weapons.includes(weaponId)) {
                total += 200;
            }
        });

        // Unclaimed mushroom rewards
        const rewardAmounts = { normal: 20, rare: 50, epic: 100, unique: 200 };
        Object.entries(state.mushroomCollection).forEach(([name, rarities]) => {
            const claimed = state.claimedRewards.mushrooms[name] || {};
            ['normal', 'rare', 'epic', 'unique'].forEach(rarity => {
                if (rarities[rarity] && !claimed[rarity]) {
                    total += rewardAmounts[rarity];
                }
            });
        });

        // Unclaimed pet rewards
        const petTypes = ['slime', 'wolf', 'eagle', 'dragon', 'fairy'];
        const petRarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];

        petTypes.forEach(type => {
            petRarities.forEach(rarity => {
                const petId = `${type}_${rarity}`;
                if (state.pets.inventory[petId] && !state.claimedRewards.pets.includes(petId)) {
                    total += 500;
                }
            });
        });

        return total;
    };

    const handleClaimWeapon = (weaponId) => {
        dispatch({ type: 'CLAIM_WEAPON_REWARD', payload: { weaponId } });
    };

    const handleClaimMushroom = (name, rarity) => {
        dispatch({ type: 'CLAIM_MUSHROOM_REWARD', payload: { name, rarity } });
    };

    const handleClaimPet = (petId) => {
        dispatch({ type: 'CLAIM_PET_REWARD', payload: { petId } });
    };

    const handleClaimAll = () => {
        dispatch({ type: 'CLAIM_ALL_REWARDS' });
    };

    const petTypes = [
        { id: 'slime', name: '슬라임', icon: '🟢' },
        { id: 'wolf', name: '늑대', icon: '🐺' },
        { id: 'eagle', name: '독수리', icon: '🦅' },
        { id: 'dragon', name: '드래곤', icon: '🐉' },
        { id: 'fairy', name: '요정', icon: '🧚' }
    ];

    const petRarities = [
        { id: 'common', name: '일반', color: '#4CAF50' },
        { id: 'rare', name: '레어', color: '#00BCD4' },
        { id: 'epic', name: '에픽', color: '#9C27B0' },
        { id: 'legendary', name: '전설', color: '#FF9800' },
        { id: 'mythic', name: '신화', color: '#FF5252' }
    ];

    const calculatePetStats = () => {
        let collected = 0;
        let total = 0;

        petTypes.forEach(type => {
            petRarities.forEach(rarity => {
                total++;
                const petId = `${type.id}_${rarity.id}`;
                if (state.pets.inventory[petId]) {
                    collected++;
                }
            });
        });

        return { collected, total };
    };

    const petStats = calculatePetStats();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '80vh',
                backgroundColor: '#2c3e50',
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '2px solid #34495e'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>📖 도감</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    borderBottom: '2px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={() => setActiveTab('weapons')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === 'weapons' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'weapons' ? '3px solid #FFD700' : '3px solid transparent',
                            color: activeTab === 'weapons' ? '#FFD700' : '#888',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        ⚔️ 무기 ({state.obtainedWeapons?.length || 0}/{Object.keys(WEAPONS).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('mushrooms')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === 'mushrooms' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'mushrooms' ? '3px solid #FFD700' : '3px solid transparent',
                            color: activeTab === 'mushrooms' ? '#FFD700' : '#888',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🍄 버섯 ({mushroomStats.collected}/{mushroomStats.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === 'pets' ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'pets' ? '3px solid #FFD700' : '3px solid transparent',
                            color: activeTab === 'pets' ? '#FFD700' : '#888',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        🐾 펫 ({petStats.collected}/{petStats.total})
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px'
                }}>
                    {activeTab === 'weapons' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: '15px'
                        }}>
                            {Object.keys(WEAPONS).map(weaponId => {
                                const id = parseInt(weaponId);
                                const weapon = WEAPONS[id];
                                const isObtained = state.obtainedWeapons?.includes(id) || false;
                                const isCurrent = state.currentWeaponId === id;

                                return (
                                    <div
                                        key={id}
                                        style={{
                                            position: 'relative',
                                            backgroundColor: isCurrent ? 'rgba(76,175,80,0.3)' : 'rgba(0,0,0,0.3)',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: isCurrent ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.1)',
                                            filter: isObtained ? 'none' : 'grayscale(100%) brightness(0.5)',
                                            opacity: isObtained ? 1 : 0.4,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Diamond Badge - show if obtained but not claimed */}
                                        {isObtained && !state.claimedRewards.weapons.includes(id) && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClaimWeapon(id);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    right: 5,
                                                    backgroundColor: '#FFD700',
                                                    color: '#000',
                                                    borderRadius: '50%',
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                                                    animation: 'pulse 1.5s infinite',
                                                    zIndex: 10
                                                }}
                                                title="200 다이아 받기"
                                            >
                                                💎
                                            </div>
                                        )}

                                        <div style={{ fontSize: '2.5rem' }}>
                                            {isObtained ? weapon.icon : '❓'}
                                        </div>
                                        <div style={{
                                            color: isObtained ? 'white' : '#888',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            wordBreak: 'keep-all'
                                        }}>
                                            {isObtained ? weapon.name : '???'}
                                        </div>
                                        <div style={{
                                            color: isObtained ? '#ffd700' : '#555',
                                            fontSize: '0.65rem'
                                        }}>
                                            Tier {id}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'mushrooms' && (
                        <div>
                            {MUSHROOM_NAMES.map((name, index) => {
                                const collection = state.mushroomCollection[name] || {
                                    normal: false,
                                    rare: false,
                                    epic: false,
                                    unique: false
                                };

                                const hasAny = collection.normal || collection.rare || collection.epic || collection.unique;

                                return (
                                    <div
                                        key={name}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '12px',
                                            marginBottom: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        {/* Mushroom Info */}
                                        <div style={{ flex: '0 0 100px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                                                {hasAny ? '🍄' : '❓'}
                                            </div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                color: hasAny ? 'white' : '#666'
                                            }}>
                                                {hasAny ? name : '???'}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#888' }}>
                                                #{index + 1}
                                            </div>
                                        </div>

                                        {/* Rarity Badges */}
                                        <div style={{
                                            flex: 1,
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '8px'
                                        }}>
                                            {['normal', 'rare', 'epic', 'unique'].map(rarity => {
                                                const isCollected = collection[rarity];
                                                const isClaimed = (state.claimedRewards.mushrooms[name] || {})[rarity];
                                                const color = getRarityColor(rarity);
                                                const labels = {
                                                    normal: '일반',
                                                    rare: '레어',
                                                    epic: '에픽',
                                                    unique: '유니크'
                                                };
                                                const rewardAmounts = {
                                                    normal: 20,
                                                    rare: 50,
                                                    epic: 100,
                                                    unique: 200
                                                };

                                                return (
                                                    <div
                                                        key={rarity}
                                                        style={{
                                                            position: 'relative',
                                                            background: isCollected ? `${color}22` : 'rgba(0,0,0,0.3)',
                                                            border: `2px solid ${isCollected ? color : '#444'}`,
                                                            borderRadius: '6px',
                                                            padding: '8px',
                                                            textAlign: 'center',
                                                            opacity: isCollected ? 1 : 0.3,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {/* Diamond Badge - show if collected but not claimed */}
                                                        {isCollected && !isClaimed && (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClaimMushroom(name, rarity);
                                                                }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: -5,
                                                                    right: -5,
                                                                    backgroundColor: '#FFD700',
                                                                    color: '#000',
                                                                    borderRadius: '50%',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
                                                                    animation: 'pulse 1.5s infinite',
                                                                    zIndex: 10
                                                                }}
                                                                title={`${rewardAmounts[rarity]} 다이아 받기`}
                                                            >
                                                                💎
                                                            </div>
                                                        )}

                                                        <div style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 'bold',
                                                            color: isCollected ? color : '#666',
                                                            marginBottom: '3px'
                                                        }}>
                                                            {labels[rarity]}
                                                        </div>
                                                        <div style={{ fontSize: '1rem' }}>
                                                            {isCollected ? '✓' : '○'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'pets' && (
                        <div>
                            {petTypes.map(type => (
                                <div key={type.id} style={{ marginBottom: '20px' }}>
                                    <h3 style={{ color: '#ddd', borderBottom: '1px solid #444', paddingBottom: '5px', marginBottom: '10px' }}>
                                        {type.icon} {type.name}
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                        gap: '15px'
                                    }}>
                                        {petRarities.map(rarity => {
                                            const petId = `${type.id}_${rarity.id}`;
                                            const isCollected = !!state.pets.inventory[petId];
                                            const isClaimed = state.claimedRewards.pets.includes(petId);

                                            return (
                                                <div
                                                    key={petId}
                                                    style={{
                                                        position: 'relative',
                                                        backgroundColor: isCollected ? `${rarity.color}22` : 'rgba(0,0,0,0.3)',
                                                        border: `2px solid ${isCollected ? rarity.color : '#444'}`,
                                                        borderRadius: '10px',
                                                        padding: '15px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        opacity: isCollected ? 1 : 0.4,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {/* Diamond Badge - show if collected but not claimed */}
                                                    {isCollected && !isClaimed && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleClaimPet(petId);
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 5,
                                                                right: 5,
                                                                backgroundColor: '#FFD700',
                                                                color: '#000',
                                                                borderRadius: '50%',
                                                                width: '30px',
                                                                height: '30px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1rem',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                                                                animation: 'pulse 1.5s infinite',
                                                                zIndex: 10
                                                            }}
                                                            title="500 다이아 받기"
                                                        >
                                                            💎
                                                        </div>
                                                    )}

                                                    <div style={{ fontSize: '2.5rem' }}>
                                                        {isCollected ? type.icon : '❓'}
                                                    </div>
                                                    <div style={{
                                                        color: isCollected ? rarity.color : '#666',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {rarity.name}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        color: '#aaa'
                                                    }}>
                                                        {isCollected ? '보유중' : '미획득'}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <div>
                        {activeTab === 'weapons' && `획득한 무기: ${state.obtainedWeapons?.length || 0} / ${Object.keys(WEAPONS).length}`}
                        {activeTab === 'mushrooms' && `수집한 버섯: ${mushroomStats.collected} / ${mushroomStats.total}`}
                        {activeTab === 'pets' && `수집한 펫: ${petStats.collected} / ${petStats.total}`}
                    </div>
                    {calculateUnclaimedRewards() > 0 && (
                        <button
                            onClick={handleClaimAll}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#FFD700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
                                animation: 'pulse 1.5s infinite',
                                fontSize: '0.9rem'
                            }}
                        >
                            💎 모두 받기 ({calculateUnclaimedRewards()})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeaponCollection;
