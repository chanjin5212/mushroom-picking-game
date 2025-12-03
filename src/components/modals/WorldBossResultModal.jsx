import React from 'react';
import { formatNumber } from '../../utils/formatNumber';

const WorldBossResultModal = ({ damage, onClose }) => {
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
            zIndex: 4000
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                border: '2px solid #FFD700',
                borderRadius: '20px',
                padding: '40px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                textAlign: 'center',
                color: 'white',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
                }}>
                    전투 종료!
                </div>

                <div>
                    <div style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '10px' }}>
                        총 입힌 데미지
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#ff4444',
                        textShadow: '0 0 10px rgba(255, 68, 68, 0.5)'
                    }}>
                        {formatNumber(damage)}
                    </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                    골드가 지급되었습니다!
                </div>

                <button
                    onClick={onClose}
                    style={{
                        padding: '15px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        color: '#000',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    마을로 돌아가기
                </button>
            </div>
            <style>{`
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default WorldBossResultModal;
