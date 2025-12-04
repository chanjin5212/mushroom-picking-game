import React, { forwardRef } from 'react';
import { useGame } from '../../context/GameContext';

const Player = forwardRef((props, ref) => {
  const { state, WEAPONS } = useGame();

  const currentWeapon = WEAPONS[state.currentWeaponId];

  // Get skin visual effects
  const getSkinStyle = () => {
    if (!state.skins?.equipped) return {};

    const parts = state.skins.equipped.split('_');
    if (parts.length !== 3) return {};

    const rarity = parts[1];
    const grade = parseInt(parts[2]);

    // Base styles by rarity (rarity = job)
    const rarityStyles = {
      common: {
        filter: 'brightness(1.1)',
        boxShadow: '0 0 15px rgba(139, 69, 19, 0.6)'
      },
      rare: {
        filter: 'hue-rotate(270deg) saturate(1.5)',
        boxShadow: '0 0 20px rgba(156, 39, 176, 0.8)'
      },
      epic: {
        filter: 'hue-rotate(0deg) saturate(1.3) brightness(0.8)',
        boxShadow: '0 0 20px rgba(244, 67, 54, 0.7)'
      },
      legendary: {
        filter: 'hue-rotate(90deg) saturate(1.4) brightness(1.2)',
        boxShadow: '0 0 25px rgba(76, 175, 80, 0.9)'
      },
      mythic: {
        filter: 'hue-rotate(45deg) saturate(2) brightness(1.3)',
        boxShadow: '0 0 30px rgba(255, 215, 0, 1), 0 0 50px rgba(255, 152, 0, 0.5)',
        transform: 'scale(1.15)'
      }
    };

    return rarityStyles[rarity] || {};
  };

  const skinStyle = getSkinStyle();

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
          filter: skinStyle.filter || 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))',
          boxShadow: skinStyle.boxShadow,
          transform: skinStyle.transform,
          imageRendering: 'pixelated',
          mixBlendMode: 'multiply',
          transition: 'all 0.3s ease'
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

      {/* Chat Bubble */}
      {state.myLastMessage && (
        <div style={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          color: 'black',
          padding: '8px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          maxWidth: '200px',
          wordBreak: 'keep-all',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 100,
          whiteSpace: 'nowrap'
        }}>
          {state.myLastMessage.message}
          {/* Speech bubble tail */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white'
          }} />
        </div>
      )}
    </div>
  );
});

export default Player;
