import React, { useEffect, useRef } from 'react';

const StageSelectMenu = ({ currentStage, maxStage, onSelectStage, onClose }) => {
    const currentStageRef = useRef(null);

    // Group stages by chapter
    const chapters = [];
    for (let chapter = 1; chapter <= maxStage.chapter; chapter++) {
        const maxStageInChapter = chapter === maxStage.chapter ? maxStage.stage : 10;
        const stages = [];
        for (let stage = 1; stage <= maxStageInChapter; stage++) {
            stages.push({ chapter, stage });
        }
        chapters.push({ chapter, stages });
    }

    // Auto-scroll to current stage
    useEffect(() => {
        if (currentStageRef.current) {
            currentStageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, []);

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
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid rgba(255,255,255,0.2)'
            }}>
                <h2 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>스테이지 선택</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0 5px',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    ✕
                </button>
            </div>

            {/* Stage Grid - Scrollable */}
            <div style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                paddingRight: '5px'
            }}>
                {chapters.map(({ chapter, stages }) => (
                    <div key={chapter} style={{
                        marginBottom: '15px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Chapter Header */}
                        <div style={{
                            color: '#FFD700',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            paddingLeft: '5px'
                        }}>
                            Chapter {chapter}
                        </div>

                        {/* Stages in this chapter */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(10, 1fr)',
                            gap: '6px'
                        }}>
                            {stages.map(({ chapter: ch, stage }) => {
                                const isCurrent = currentStage.chapter === ch && currentStage.stage === stage;
                                const isBoss = stage === 10;

                                return (
                                    <button
                                        key={`${ch}-${stage}`}
                                        ref={isCurrent ? currentStageRef : null}
                                        onClick={() => {
                                            onSelectStage({ chapter: ch, stage });
                                            onClose();
                                        }}
                                        style={{
                                            padding: '8px 4px',
                                            backgroundColor: isCurrent
                                                ? '#4caf50'
                                                : isBoss
                                                    ? '#ff4444'
                                                    : '#2196f3',
                                            color: 'white',
                                            border: isCurrent ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.5)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: isCurrent ? 'bold' : '600',
                                            fontSize: '0.7rem',
                                            transition: 'all 0.2s',
                                            boxShadow: isCurrent
                                                ? '0 0 15px rgba(255,215,0,0.6), 0 4px 8px rgba(0,0,0,0.3)'
                                                : '0 2px 4px rgba(0,0,0,0.3)',
                                            transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                                            position: 'relative',
                                            minWidth: '0',
                                            width: '100%',
                                            aspectRatio: '1'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isCurrent) {
                                                e.target.style.transform = 'scale(1.1)';
                                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isCurrent) {
                                                e.target.style.transform = 'scale(1)';
                                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                                            }
                                        }}
                                    >
                                        {stage}
                                        {isCurrent && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                right: '-6px',
                                                backgroundColor: '#FFD700',
                                                color: '#000',
                                                borderRadius: '50%',
                                                width: '14px',
                                                height: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.55rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}>
                                                ★
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{
                marginTop: '15px',
                paddingTop: '10px',
                borderTop: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color: '#ccc'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '3px', border: '2px solid #FFD700' }}></div>
                    <span>현재</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#ff4444', borderRadius: '3px' }}></div>
                    <span>보스</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#2196f3', borderRadius: '3px' }}></div>
                    <span>일반</span>
                </div>
            </div>
        </div>
    );
};

export default StageSelectMenu;
