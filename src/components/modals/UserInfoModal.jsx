import React from 'react';
import { useGame } from '../../context/GameContext';

const UserInfoModal = ({ onClose }) => {
    const { state, logout, manualSave, resetGame } = useGame();

    const handleSave = () => {
        const success = manualSave();
        if (success) {
            alert('저장되었습니다.');
        }
    };

    const handleReset = async () => {
        if (window.confirm('정말로 게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다!')) {
            const success = await resetGame();
            if (success) {
                alert('초기화되었습니다.');
                onClose();
            }
        }
    };

    const handleLogout = () => {
        onClose();
        logout();
    };

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
                maxWidth: '400px',
                backgroundColor: '#2c3e50',
                borderRadius: '20px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '2px solid #34495e',
                alignItems: 'center'
            }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
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

                {/* User Avatar */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '20px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    {state.user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>

                <h2 style={{ color: 'white', margin: '0 0 30px 0' }}>{state.user?.username || 'Guest'}</h2>

                {/* Actions */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '15px',
                            backgroundColor: 'rgba(76,175,80,0.2)',
                            color: '#4caf50',
                            border: '1px solid rgba(76,175,80,0.5)',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>💾</span> 저장하기
                    </button>

                    <button
                        onClick={handleReset}
                        style={{
                            padding: '15px',
                            backgroundColor: 'rgba(255,152,0,0.2)',
                            color: '#ff9800',
                            border: '1px solid rgba(255,152,0,0.5)',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>🔄</span> 초기화
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '15px',
                            backgroundColor: 'rgba(244,67,54,0.2)',
                            color: '#f44336',
                            border: '1px solid rgba(244,67,54,0.5)',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>🚪</span> 로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;
