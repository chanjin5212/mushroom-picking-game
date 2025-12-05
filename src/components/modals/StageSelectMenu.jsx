import React, { useEffect, useRef } from 'react';

// Mushroom names by chapter (100 types)
const MUSHROOM_NAMES = [
    '팽이버섯', '느타리버섯', '표고버섯', '송이버섯', '양송이버섯',
    '목이버섯', '석이버섯', '영지버섯', '상황버섯', '동충하초',
    '싸리버섯', '꽃송이버섯', '노루궁뎅이버섯', '차가버섯', '아가리쿠스버섯',
    '새송이버섯', '만가닥버섯', '잎새버섯', '능이버섯', '복령버섯',
    '독버섯', '광대버섯', '붉은버섯', '파란버섯', '보라버섯',
    '황금버섯', '은빛버섯', '청동버섯', '철버섯', '강철버섯',
    '동굴버섯', '심해버섯', '화산버섯', '용암버섯', '얼음버섯',
    '눈꽃버섯', '수정버섯', '다이아버섯', '루비버섯', '사파이어버섯',
    '에메랄드버섯', '자수정버섯', '호박버섯', '진주버섯', '산호버섯',
    '산악버섯', '고산버섯', '평원버섯', '사막버섯', '정글버섯',
    '늪지버섯', '숲속버섯', '초원버섯', '설원버섯', '화염버섯',
    '번개버섯', '천둥버섯', '폭풍버섯', '태풍버섯', '지진버섯',
    '해일버섯', '토네이도버섯', '블리자드버섯', '유성버섯', '혜성버섯',
    '별빛버섯', '달빛버섯', '햇빛버섯', '무지개버섯', '오로라버섯',
    '심연버섯', '어둠버섯', '그림자버섯', '공허버섯', '혼돈버섯',
    '타락버섯', '저주버섯', '악마버섯', '천사버섯', '신성버섯',
    '고대버섯', '태초버섯', '원시버섯', '전설버섯', '신화버섯',
    '영웅버섯', '왕의버섯', '황제버섯', '제왕버섯', '패왕버섯',
    '용의버섯', '불사조버섯', '기린버섯', '현무버섯', '백호버섯',
    '청룡버섯', '주작버섯', '천마버섯', '신수버섯', '성수버섯',
    '거대버섯', '초거대버섯', '극대버섯', '무한버섯', '영원버섯'
];

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

    // Auto-scroll to current stage (instant)
    useEffect(() => {
        if (currentStageRef.current) {
            currentStageRef.current.scrollIntoView({
                behavior: 'auto',
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
            padding: '25px',
            borderRadius: '15px',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            zIndex: 1000,
            maxWidth: '650px',
            maxHeight: '70vh',
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
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '2px solid rgba(255,255,255,0.3)'
            }}>
                <h2 style={{
                    color: 'white',
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: 'bold'
                }}>스테이지 선택</h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        fontWeight: 'bold'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Stage Grid - Scrollable */}
            <div style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                paddingRight: '10px'
            }}>
                {chapters.map(({ chapter, stages }) => (
                    <div key={chapter} style={{
                        marginBottom: '20px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.15)'
                    }}>
                        {/* Chapter Header */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                color: '#FFD700',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                letterSpacing: '1px'
                            }}>
                                CHAPTER {chapter}
                            </div>
                            <div style={{
                                color: '#aaa',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                            }}>
                                🍄 {MUSHROOM_NAMES[Math.floor((chapter - 1) / 25)] || '???'}
                            </div>
                        </div>

                        {/* Stages Grid - 5 columns */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '12px',
                            justifyItems: 'center'
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
                                            width: '60px',
                                            height: '60px',
                                            backgroundColor: isCurrent
                                                ? '#4caf50'
                                                : isBoss
                                                    ? '#ff4444'
                                                    : '#2196f3',
                                            color: 'white',
                                            border: isCurrent
                                                ? '3px solid #FFD700'
                                                : '2px solid rgba(255,255,255,0.6)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            transition: 'all 0.2s',
                                            boxShadow: isCurrent
                                                ? '0 0 20px rgba(255,215,0,0.7), 0 4px 10px rgba(0,0,0,0.4)'
                                                : '0 3px 6px rgba(0,0,0,0.3)',
                                            transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isCurrent) {
                                                e.target.style.transform = 'scale(1.1)';
                                                e.target.style.boxShadow = '0 5px 12px rgba(0,0,0,0.5)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isCurrent) {
                                                e.target.style.transform = 'scale(1)';
                                                e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
                                            }
                                        }}
                                    >
                                        {stage}
                                        {isCurrent && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                backgroundColor: '#FFD700',
                                                color: '#000',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                                                border: '2px solid #000'
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
                marginTop: '20px',
                paddingTop: '15px',
                borderTop: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#ddd'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#4caf50',
                        borderRadius: '4px',
                        border: '2px solid #FFD700',
                        boxShadow: '0 0 8px rgba(255,215,0,0.5)'
                    }}></div>
                    <span style={{ fontWeight: '600' }}>현재</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#ff4444',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.6)'
                    }}></div>
                    <span style={{ fontWeight: '600' }}>보스</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#2196f3',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.6)'
                    }}></div>
                    <span style={{ fontWeight: '600' }}>일반</span>
                </div>
            </div>
        </div>
    );
};

export default StageSelectMenu;
