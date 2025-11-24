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
        width: '40px',
        height: '40px',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        willChange: 'transform'
      }}
    >
      {/* Character Body - Pixel Art Style */}
      <div style={{
        position: 'relative',
        width: '32px',
        height: '40px'
      }}>
        {/* Head */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#ffdbac',
          border: '2px solid #d4a574',
          boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Eyes */}
          <div style={{ position: 'absolute', top: '5px', left: '3px', width: '3px', height: '3px', borderRadius: '50%', background: '#000' }} />
          <div style={{ position: 'absolute', top: '5px', right: '3px', width: '3px', height: '3px', borderRadius: '50%', background: '#000' }} />
          {/* Smile */}
          <div style={{ position: 'absolute', bottom: '3px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '3px', borderBottom: '2px solid #000', borderRadius: '0 0 50% 50%' }} />
        </div>

        {/* Body */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '6px',
          width: '20px',
          height: '14px',
          background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
          borderRadius: '4px',
          border: '2px solid #2c5f8d',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />

        {/* Arms */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '2px',
          width: '6px',
          height: '10px',
          background: '#ffdbac',
          borderRadius: '3px',
          border: '1px solid #d4a574'
        }} />
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '2px',
          width: '6px',
          height: '10px',
          background: '#ffdbac',
          borderRadius: '3px',
          border: '1px solid #d4a574'
        }} />

        {/* Legs */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '8px',
          width: '6px',
          height: '10px',
          background: '#2c3e50',
          borderRadius: '2px',
          border: '1px solid #1a252f'
        }} />
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '8px',
          width: '6px',
          height: '10px',
          background: '#2c3e50',
          borderRadius: '2px',
          border: '1px solid #1a252f'
        }} />
      </div>

      {/* Weapon Icon */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        right: -8,
        fontSize: '18px',
        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))',
        transform: 'rotate(25deg)'
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
