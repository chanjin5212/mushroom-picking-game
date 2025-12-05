import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import ArtifactPanel from './ArtifactPanel';
import PetPanel from './PetPanel';
import WeaponPanel from './WeaponPanel';
import StatsPanel from './StatsPanel';

const BottomPanel = () => {
    const { state } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('weapon'); // 'weapon' or 'stats' or 'artifacts' or 'pets'

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '60vh',
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 40px))',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000,
            color: 'white',
            boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Handle / Toggle Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px'
                }}
            >
                <div style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px'
                }} />
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#aaa' }}>
                    {isOpen ? '▼ 닫기' : '▲ 업그레이드'}
                </span>
            </div>

            {/* Tabs */}
            {isOpen && (
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('weapon')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'weapon' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'weapon' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        ⚔️ 무기
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'stats' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'stats' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        💪 스탯
                    </button>
                    <button
                        onClick={() => setActiveTab('artifacts')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'artifacts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'artifacts' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                        }}
                    >
                        🏺 유물
                        {(state.currentStage.chapter < 25 || (state.currentStage.chapter === 25 && state.currentStage.stage < 1)) && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                border: '1px solid #ff9800'
                            }}>
                                25-1 해금
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === 'pets' ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'pets' ? '#fff' : '#888',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px'
                        }}
                    >
                        🐾 펫
                        {(state.currentStage.chapter < 50 || (state.currentStage.chapter === 50 && state.currentStage.stage < 1)) && (
                            <span style={{
                                fontSize: '0.7rem',
                                color: '#ff9800',
                                background: 'rgba(255, 152, 0, 0.2)',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                border: '1px solid #ff9800'
                            }}>
                                50-1 해금
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                {!isOpen && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>
                        업그레이드 메뉴를 열어주세요
                    </div>
                )}

                {isOpen && activeTab === 'weapon' && <WeaponPanel />}
                {isOpen && activeTab === 'stats' && <StatsPanel />}
                {isOpen && activeTab === 'artifacts' && <ArtifactPanel />}
                {isOpen && activeTab === 'pets' && <PetPanel />}
            </div>
        </div>
    );
};

export default BottomPanel;
