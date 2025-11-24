import React from 'react';
import { useGame } from '../context/GameContext';

const HUD = () => {
    const { state } = useGame();

    return (
        <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '15px 25px',
            backgroundColor: 'var(--color-panel)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            zIndex: 100
        }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fbc02d' }}>
                💰 {state.gold}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                ⚔️ Damage: {state.clickDamage}
            </div>
        </div>
    );
};

export default HUD;
