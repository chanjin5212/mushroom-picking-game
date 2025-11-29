import React from 'react';
import { useGame } from '../context/GameContext';

const WeaponCollection = ({ onClose }) => {
    const { state, WEAPONS } = useGame();

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
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '80vh',
                backgroundColor: '#2c3e50',
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '2px solid #34495e'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>📖 무기 도감</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Weapons Grid */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '15px',
                    padding: '10px'
                }}>
                    {Object.keys(WEAPONS).map(weaponId => {
                        const id = parseInt(weaponId);
                        const weapon = WEAPONS[id];
                        const isObtained = state.obtainedWeapons?.includes(id) || false;
                        const isCurrent = state.currentWeaponId === id;

                        return (
                            <div
                                key={id}
                                style={{
                                    backgroundColor: isCurrent ? 'rgba(76,175,80,0.3)' : 'rgba(0,0,0,0.3)',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: isCurrent ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.1)',
                                    filter: isObtained ? 'none' : 'grayscale(100%) brightness(0.5)',
                                    opacity: isObtained ? 1 : 0.4,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem' }}>
                                    {isObtained ? weapon.icon : '❓'}
                                </div>
                                <div style={{
                                    color: isObtained ? 'white' : '#888',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    wordBreak: 'keep-all'
                                }}>
                                    {isObtained ? weapon.name : '???'}
                                </div>
                                <div style={{
                                    color: isObtained ? '#ffd700' : '#555',
                                    fontSize: '0.65rem'
                                }}>
                                    Tier {id}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Stats */}
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '10px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    획득한 무기: {state.obtainedWeapons?.length || 0} / {Object.keys(WEAPONS).length}
                </div>
            </div>
        </div>
    );
};

export default WeaponCollection;
