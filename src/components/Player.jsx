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
        left: 0,
        top: 0,
        width: '60px',
        height: '60px',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        willChange: 'transform'
      }}
    >
      {/* Character Image */}
      <img
        src="/assets/player.png"
        alt="Player"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))',
          imageRendering: 'pixelated',
          mixBlendMode: 'multiply' // Make white background transparent
        }}
      />

      {/* Weapon Icon - Positioned at hand */}
      <div style={{
        position: 'absolute',
        top: '25px', // Adjusted for larger size and hand position
        right: '5px', // Adjusted for extended hand
        fontSize: '24px', // Larger weapon
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
        transform: 'rotate(45deg)',
        zIndex: 2,
        transformOrigin: 'bottom left'
      }}>
        {currentWeapon.icon}
      </div>

      {/* Player Label */}
      <div style={{
        position: 'absolute',
        top: -22,
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold',
        textShadow: '1px 1px 2px black',
        background: 'rgba(0,0,0,0.5)',
        padding: '2px 6px',
        borderRadius: '8px',
        whiteSpace: 'nowrap'
      }}>
        나
      </div>
    </div>
  );
});

export default Player;
