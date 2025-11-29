import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { formatNumber } from '../utils/formatNumber';

const RankingBoard = ({ onClose }) => {
    const { fetchRankings, WEAPONS, state } = useGame();
    const [rankings, setRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRankings = async () => {
            setIsLoading(true);
            const data = await fetchRankings();
            setRankings(data);
            setIsLoading(false);
        };
        loadRankings();
    }, []);

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
                maxWidth: '500px',
                height: '80%',
                backgroundColor: '#2c3e50',
                borderRadius: '20px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '2px solid #34495e'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🏆 랭킹
                    </h2>
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

                {isLoading ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                        로딩 중...
                    </div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {rankings.map((user, index) => {
                            const weaponId = user.game_data?.currentWeaponId || 0;
                            const weaponLevel = user.game_data?.weaponLevel || 0;
                            const weapon = WEAPONS[weaponId];
                            const isMe = user.username === state.user?.username;

                            let rankColor = '#fff';
                            let rankIcon = null;
                            if (index === 0) { rankColor = '#ffd700'; rankIcon = '🥇'; }
                            else if (index === 1) { rankColor = '#c0c0c0'; rankIcon = '🥈'; }
                            else if (index === 2) { rankColor = '#cd7f32'; rankIcon = '🥉'; }

                            return (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px',
                                    marginBottom: '10px',
                                    backgroundColor: isMe ? 'rgba(52, 152, 219, 0.3)' : 'rgba(0,0,0,0.2)',
                                    borderRadius: '10px',
                                    border: isMe ? '1px solid #3498db' : 'none'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                        color: rankColor,
                                        textAlign: 'center'
                                    }}>
                                        {rankIcon || index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>
                                            {user.username}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#bdc3c7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>{weapon?.icon}</span>
                                            <span>{weapon?.name}</span>
                                            <span style={{ color: '#2ecc71' }}>+{weaponLevel}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {rankings.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#7f8c8d', marginTop: '50px' }}>
                                랭킹 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingBoard;
