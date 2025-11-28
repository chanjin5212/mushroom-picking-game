import React from 'react';
import { useGame } from '../context/GameContext';

const PortalMenu = () => {
    const { state, dispatch } = useGame();

    if (state.currentScene !== 'village' || !state.isPortalMenuOpen) return null;

    // Generate map info for 1000 maps
    const generateMapInfo = () => {
        const mapInfo = {};
        for (let level = 1; level <= 1000; level++) {
            const requiredWeapon = Math.floor(level / 20);
            // Special case: Level 1 starts very easy (20 HP)
            const mushroomHP = level === 1 ? 10 : Math.floor(Math.pow(10, level * 0.05) * 100);
            const reward = Math.floor(Math.pow(10, level * 0.04) * 50);

            mapInfo[`map_${level}`] = {
                name: `🗺️ 레벨 ${level}`,
                level: level,
                hp: mushroomHP,
                reward: reward,
                requiredWeapon: Math.min(requiredWeapon, 49),
                theme: level <= 200 ? 'beginner' :
                    level <= 400 ? 'intermediate' :
                        level <= 600 ? 'advanced' :
                            level <= 800 ? 'expert' : 'boss'
            };
        }
        return mapInfo;
    };

    const mapInfo = generateMapInfo();

    // Find recommended map: Highest level where HP <= Damage * 10
    // This means you can kill it in about 10 hits (without crits), which is good for farming
    const recommendedMap = Object.values(mapInfo)
        .sort((a, b) => a.level - b.level)
        .filter(info => info.hp <= state.clickDamage * 10)
        .pop() || mapInfo['map_1']; // Default to map 1 if none found

    const handleMapSelect = (mapKey) => {
        const map = mapInfo[mapKey];
        const isLocked = state.currentWeaponId < map.requiredWeapon;

        if (isLocked) {
            alert(`이 맵은 ${map.requiredWeapon + 1}번째 무기가 필요합니다!`);
            return;
        }

        dispatch({ type: 'TOGGLE_PORTAL_MENU' });
        dispatch({ type: 'SET_LOADING', payload: true });

        setTimeout(() => {
            const centerPos = { x: 210, y: 180 };
            dispatch({ type: 'SWITCH_SCENE', payload: { scene: mapKey, pos: centerPos } });
        }, 500);
    };

    const getThemeColor = (theme) => {
        switch (theme) {
            case 'beginner': return '#4caf50';
            case 'intermediate': return '#2196f3';
            case 'advanced': return '#ff9800';
            case 'expert': return '#f44336';
            case 'boss': return '#9c27b0';
            default: return '#666';
        }
    };

    // Format HP for display
    const formatHP = (hp) => {
        if (hp >= 1e15) return `${(hp / 1e15).toFixed(1)}P`;
        if (hp >= 1e12) return `${(hp / 1e12).toFixed(1)}T`;
        if (hp >= 1e9) return `${(hp / 1e9).toFixed(1)}B`;
        if (hp >= 1e6) return `${(hp / 1e6).toFixed(1)}M`;
        if (hp >= 1e3) return `${(hp / 1e3).toFixed(1)}K`;
        return hp.toString();
    };

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
            padding: '10px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '15px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'sticky', top: 0, background: '#fff', paddingBottom: '10px', borderBottom: '2px solid #eee' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>🌀 포탈 선택 (1-1000)</h2>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_PORTAL_MENU' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        ❌
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '8px'
                }}>
                    {Object.entries(mapInfo).map(([key, info]) => {
                        const isLocked = state.currentWeaponId < info.requiredWeapon;
                        const themeColor = getThemeColor(info.theme);
                        const isRecommended = recommendedMap && info.level === recommendedMap.level;

                        return (
                            <button
                                key={key}
                                onClick={() => handleMapSelect(key)}
                                disabled={isLocked}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: isRecommended ? '3px solid #ffeb3b' : `2px solid ${isLocked ? '#ccc' : themeColor}`,
                                    backgroundColor: isLocked ? '#f5f5f5' : (isRecommended ? 'rgba(255, 235, 59, 0.1)' : '#fff'),
                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isLocked ? 0.5 : 1,
                                    textAlign: 'center',
                                    position: 'relative',
                                    transform: isRecommended ? 'scale(1.05)' : 'scale(1)',
                                    zIndex: isRecommended ? 10 : 1
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px', color: isLocked ? '#999' : themeColor }}>
                                    Lv.{info.level} {isRecommended && <span style={{ fontSize: '0.8rem' }}>👍</span>}
                                </div>
                                {isRecommended && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#ffeb3b',
                                        color: '#000',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        추천 사냥터
                                    </div>
                                )}
                                <div style={{ fontSize: '0.7rem', color: isLocked ? '#999' : '#666', marginBottom: '2px' }}>
                                    HP: {formatHP(info.hp)}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: isLocked ? '#999' : '#f9a825', fontWeight: 'bold' }}>
                                    💰 {formatHP(info.reward)}
                                </div>
                                {isLocked && (
                                    <div style={{ fontSize: '0.65rem', color: '#f44336', marginTop: '4px' }}>
                                        🔒 무기 {info.requiredWeapon + 1}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PortalMenu;
