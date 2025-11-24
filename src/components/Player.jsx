import React, { forwardRef } from 'react';
import { useGame } from '../context/GameContext';

const Player = forwardRef((props, ref) => {
  const { state, WEAPONS } = useGame();

  const currentWeapon = WEAPONS[state.currentWeaponId];

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: 0, // Controlled via transform in parent
        top: 0,  // Controlled via transform in parent
        width: '40px',
        height: '40px',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        willChange: 'transform' // Optimization hint
      }}
    >
      {/* Player Body */}
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '16px'
      }}>
        😊
      </div>

      {/* Weapon Icon */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        right: -5,
        fontSize: '20px',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
        transform: 'rotate(25deg)'
      }}>
        {currentWeapon.icon}
      </div>

      {/* Player Label */}
      <div style={{
        position: 'absolute',
        top: -20,
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px black',
        background: 'rgba(0,0,0,0.5)',
        padding: '2px 6px',
        borderRadius: '8px'
      }}>
        나
      </div>
    </div>
  );
});

export default Player;
