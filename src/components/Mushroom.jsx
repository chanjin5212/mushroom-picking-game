import React from 'react';

const Mushroom = ({ id, x, y, hp, maxHp, type, name, reward, isDead }) => {
    if (isDead) return null;

    const hpPercent = (hp / maxHp) * 100;
    const mushroomEmoji = '🍄';

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
                fontSize: '40px',
                transition: 'transform 0.1s',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
            }}>
                {mushroomEmoji}
            </div>

            {/* HP Bar */}
            <div style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '6px',
                background: '#333',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid #000'
            }}>
                <div style={{
                    width: `${hpPercent}%`,
                    height: '100%',
                    background: type === 'boss' ? '#9C27B0' : type === 'red' ? '#F44336' : '#4CAF50',
                    transition: 'width 0.2s'
                }} />
            </div>

            {/* Mushroom Name */}
            <div style={{
                position: 'absolute',
                top: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '10px',
                color: 'white',
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
