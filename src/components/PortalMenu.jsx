import React from 'react';
import { useGame } from '../context/GameContext';

const PortalMenu = () => {
    const { state, dispatch } = useGame();

    if (state.currentScene !== 'village' || !state.isPortalMenuOpen) return null;

    // Map metadata with display names and level requirements
    const mapInfo = {
        forest_1: { name: '🌲 평화로운 숲', level: 1, requiredWeapon: 0, theme: 'beginner' },
        forest_2: { name: '🌳 깊은 숲', level: 2, requiredWeapon: 0, theme: 'beginner' },
        forest_3: { name: '🍄 버섯 숲', level: 3, requiredWeapon: 0, theme: 'beginner' },
        forest_4: { name: '🌿 독버섯 숲', level: 4, requiredWeapon: 1, theme: 'beginner' },
        forest_5: { name: '🔴 붉은 숲', level: 5, requiredWeapon: 1, theme: 'beginner' },

        cave_1: { name: '🕳️ 동굴 입구', level: 6, requiredWeapon: 1, theme: 'intermediate' },
        cave_2: { name: '💎 수정 동굴', level: 7, requiredWeapon: 2, theme: 'intermediate' },
        cave_3: { name: '❄️ 얼음 동굴', level: 8, requiredWeapon: 2, theme: 'intermediate' },
        cave_4: { name: '🔥 용암 동굴', level: 9, requiredWeapon: 2, theme: 'intermediate' },
        cave_5: { name: '⚫ 깊은 동굴', level: 10, requiredWeapon: 2, theme: 'intermediate' },

        mountain_1: { name: '⛰️ 산기슭', level: 11, requiredWeapon: 3, theme: 'advanced' },
        mountain_2: { name: '🏔️ 고산지대', level: 12, requiredWeapon: 3, theme: 'advanced' },
        mountain_3: { name: '⚡ 천둥산', level: 13, requiredWeapon: 3, theme: 'advanced' },
        mountain_4: { name: '🗻 거대산', level: 14, requiredWeapon: 3, theme: 'advanced' },
        mountain_5: { name: '🏔️ 정상', level: 15, requiredWeapon: 3, theme: 'advanced' },

        abyss_1: { name: '🌑 심연 입구', level: 16, requiredWeapon: 4, theme: 'expert' },
        abyss_2: { name: '⚫ 공허의 땅', level: 17, requiredWeapon: 4, theme: 'expert' },
        abyss_3: { name: '👿 타락의 땅', level: 18, requiredWeapon: 4, theme: 'expert' },
        abyss_4: { name: '😈 악마의 땅', level: 19, requiredWeapon: 4, theme: 'expert' },

        throne: { name: '👑 왕좌의 방', level: 20, requiredWeapon: 4, theme: 'boss' },
    };

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
            const centerPos = { x: 400, y: 300 };
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
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '20px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>🌀 포탈 선택</h2>
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '12px'
                }}>
                    {Object.entries(mapInfo).map(([key, info]) => {
                        const isLocked = state.currentWeaponId < info.requiredWeapon;
                        const themeColor = getThemeColor(info.theme);

                        return (
                            <button
                                key={key}
                                onClick={() => handleMapSelect(key)}
                                disabled={isLocked}
                                style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: `2px solid ${isLocked ? '#ccc' : themeColor}`,
                                    backgroundColor: isLocked ? '#f5f5f5' : '#fff',
                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isLocked ? 0.5 : 1,
                                    textAlign: 'left'
                                }}
                            >
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px', color: isLocked ? '#999' : themeColor }}>
                                    Lv.{info.level}
                                </div>
                                <div style={{ fontSize: '0.95rem', color: isLocked ? '#999' : '#333', marginBottom: '4px' }}>
                                    {info.name}
                                </div>
                                {isLocked && (
                                    <div style={{ fontSize: '0.75rem', color: '#f44336', marginTop: '8px' }}>
                                        🔒 무기 {info.requiredWeapon + 1} 필요
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
