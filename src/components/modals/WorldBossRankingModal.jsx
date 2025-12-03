import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatNumber } from '../../utils/formatNumber';

const WorldBossRankingModal = ({ onClose }) => {
    const { fetchWorldBossRankings } = useGame();
    const [rankings, setRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRankings = async () => {
            setIsLoading(true);
            const data = await fetchWorldBossRankings();
            setRankings(data);
            setIsLoading(false);
        };
        loadRankings();
    }, [fetchWorldBossRankings]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3100 // Higher than WorldBossModal if needed, but usually replaces it or overlays
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                border: '2px solid #FFD700',
                borderRadius: '20px',
                padding: '30px',
                width: '90%',
                maxWidth: '500px',
                height: '80%',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '15px'
                }}>
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: '#FFD700',
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    }}>
                        🏆 명예의 전당
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}>✕</button>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '10px'
                }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            랭킹 불러오는 중...
                        </div>
                    ) : rankings.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>순위</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>이름</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>데미지</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((rank, index) => (
                                    <tr key={index} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        background: index < 3 ? 'rgba(255, 215, 0, 0.05)' : 'transparent'
                                    }}>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                        </td>
                                        <td style={{ padding: '10px' }}>{rank.username}</td>
                                        <td style={{ padding: '10px', textAlign: 'right', color: '#FFD700', fontWeight: 'bold' }}>
                                            {formatNumber(rank.damage)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            아직 기록이 없습니다.
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        padding: '15px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        backgroundColor: '#444',
                        color: '#ccc',
                        width: '100%'
                    }}
                >
                    닫기
                </button>
            </div>
        </div>
    );
};

export default WorldBossRankingModal;
