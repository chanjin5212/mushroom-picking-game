import React from 'react';

const Mushroom = ({ id, x, y, hp, maxHp, type, name, reward, isDead, scale = 1, rarity = 'normal', color = null }) => {
    if (isDead) return null;

    const hpPercent = (hp / maxHp) * 100;
    const mushroomEmoji = '🍄';
    const size = 40 * scale; // Base size 40px, scaled by scale prop
    const hpBarWidth = 50 * scale;

    // Determine glow effect based on rarity
    let glowEffect = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
    if (rarity === 'rare') {
        glowEffect = 'drop-shadow(0 0 8px #00BCD4) drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
    } else if (rarity === 'epic') {
        glowEffect = 'drop-shadow(0 0 12px #9C27B0) drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
    } else if (rarity === 'unique') {
        glowEffect = 'drop-shadow(0 0 16px #FFD700) drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                userSelect: 'none',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none' // Clicks handled by GameCanvas or auto-attack
            }}
        >
            {/* Mushroom */}
            <div style={{
                fontSize: `${size}px`,
                transition: 'transform 0.1s',
                filter: glowEffect
            }}>
                {mushroomEmoji}
            </div>

            {/* HP Bar - Hide for boss as it's shown in HUD */}
            {type !== 'boss' && (
                <div style={{
                    position: 'absolute',
                    top: -10 * scale,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${hpBarWidth}px`,
                    height: `${6 * scale}px`,
                    background: '#333',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    border: '1px solid #000'
                }}>
                    <div style={{
                        width: `${hpPercent}%`,
                        height: '100%',
                        background: color || (type === 'red' ? '#F44336' : '#4CAF50'),
                        transition: 'width 0.2s'
                    }} />
                </div>
            )}

            {/* Mushroom Name with Rarity Color */}
            <div style={{
                position: 'absolute',
                top: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: color || 'white',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px black',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
            }}>
                {name}
            </div>
        </div>
    );
};

export default Mushroom;
