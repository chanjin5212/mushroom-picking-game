import React from 'react';

const Mushroom = ({ x, y, hp, maxHp, type = 'normal', name }) => {
    const scale = 0.8 + (hp / maxHp) * 0.2;

    let capColor = '#8d6e63'; // Brown
    if (type === 'red') capColor = '#e53935'; // Red
    if (type === 'boss') capColor = '#5e35b1'; // Purple

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: type === 'boss' ? '100px' : '50px',
                height: type === 'boss' ? '100px' : '50px',
                backgroundColor: '#d7ccc8',
                borderRadius: '40% 40% 10% 10%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${scale})`,
                transition: 'transform 0.1s',
                zIndex: type === 'boss' ? 5 : 1
            }}
        >
            {/* Name Tag */}
            <div style={{
                position: 'absolute',
                top: -20,
                whiteSpace: 'nowrap',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px black',
                pointerEvents: 'none'
            }}>
                {name}
            </div>

            {/* Cap */}
            <div style={{
                width: '100%',
                height: '40%',
                backgroundColor: capColor,
                borderRadius: '50% 50% 10% 10%',
                position: 'absolute',
                top: 0,
                boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.2)'
            }}>
                {/* Spots for Red/Boss mushrooms */}
                {(type === 'red' || type === 'boss') && (
                    <>
                        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '15%', height: '15%', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)' }}></div>
                        <div style={{ position: 'absolute', top: '40%', right: '25%', width: '20%', height: '20%', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)' }}></div>
                    </>
                )}
            </div>

            {/* HP Bar */}
            <div style={{
                position: 'absolute',
                bottom: -10,
                width: '80%',
                height: '6px',
                backgroundColor: '#444',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${(hp / maxHp) * 100}%`,
                    height: '100%',
                    backgroundColor: '#ef5350',
                    transition: 'width 0.2s'
                }}></div>
            </div>
        </div>
    );
};

export default Mushroom;
