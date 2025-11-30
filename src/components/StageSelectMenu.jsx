import React from 'react';

const StageSelectMenu = ({ currentStage, maxStage, onSelectStage, onClose }) => {
    const stages = [];

    // Generate stage list up to maxStage
    for (let chapter = 1; chapter <= maxStage.chapter; chapter++) {
        const maxStageInChapter = chapter === maxStage.chapter ? maxStage.stage : 10;
        for (let stage = 1; stage <= maxStageInChapter; stage++) {
            stages.push({ chapter, stage });
        }
    }

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            padding: '20px',
            borderRadius: '15px',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            zIndex: 1000,
            maxWidth: '500px',
            maxHeight: '70vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>스테이지 선택</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px'
            }}>
                {stages.map(({ chapter, stage }) => {
                    const isCurrent = currentStage.chapter === chapter && currentStage.stage === stage;
                    const isBoss = stage === 10;

                    return (
                        <button
                            key={`${chapter}-${stage}`}
                            onClick={() => {
                                onSelectStage({ chapter, stage });
                                onClose();
                            }}
                            style={{
                                padding: '15px 10px',
                                backgroundColor: isCurrent
                                    ? '#4caf50'
                                    : isBoss
                                        ? '#ff4444'
                                        : '#2196f3',
                                color: 'white',
                                border: '2px solid white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            {chapter}-{stage}
                            {isBoss && <div style={{ fontSize: '0.7rem' }}>BOSS</div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StageSelectMenu;
