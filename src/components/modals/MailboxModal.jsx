import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';

const MailboxModal = ({ onClose }) => {
    const { state, dispatch } = useGame();
    const [selectedMailId, setSelectedMailId] = useState(null);

    // Get mailbox from state
    const mails = state.mailbox || [];

    // Count unread mails
    const unreadCount = mails.filter(mail => !mail.isRead).length;

    // Get selected mail - use useMemo to always get fresh state
    const selectedMail = useMemo(() => {
        return mails.find(m => m.id === selectedMailId);
    }, [mails, selectedMailId]);

    // Auto-select first mail if none selected and mark as read
    useEffect(() => {
        if (mails.length > 0 && !selectedMailId) {
            const firstMail = mails[0];
            setSelectedMailId(firstMail.id);
            // Mark as read when auto-selected
            if (!firstMail.isRead) {
                dispatch({ type: 'MARK_MAIL_READ', payload: firstMail.id });
            }
        }
    }, [mails, selectedMailId, dispatch]);

    const handleSelectMail = (mailId) => {
        setSelectedMailId(mailId);

        // Mark as read when selected
        const mail = mails.find(m => m.id === mailId);
        if (mail && !mail.isRead) {
            dispatch({ type: 'MARK_MAIL_READ', payload: mailId });
        }
    };

    const handleClaimReward = (mailId) => {
        dispatch({ type: 'CLAIM_MAIL_REWARD', payload: mailId });
    };

    const handleDelete = (mailId) => {
        dispatch({ type: 'DELETE_MAIL', payload: mailId });

        // Select next mail after deletion
        const currentIndex = mails.findIndex(m => m.id === mailId);
        if (mails.length > 1) {
            const nextMail = mails[currentIndex + 1] || mails[currentIndex - 1];
            if (nextMail) {
                setSelectedMailId(nextMail.id);
                // Mark as read when auto-selected after deletion
                if (!nextMail.isRead) {
                    dispatch({ type: 'MARK_MAIL_READ', payload: nextMail.id });
                }
            }
        } else {
            setSelectedMailId(null);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: 'rgba(20, 20, 20, 0.98)',
                borderRadius: '15px',
                border: '3px solid rgba(255, 215, 0, 0.5)',
                width: '90%',
                maxWidth: '1000px',
                height: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{
                            color: '#FFD700',
                            margin: 0,
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            📬 우편함
                        </h2>
                        {unreadCount > 0 && (
                            <div style={{
                                backgroundColor: '#ff4444',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '4px 10px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            fontSize: '1.3rem',
                            cursor: 'pointer',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Main Content - 2 Column Layout */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden'
                }}>
                    {/* Left: Mail List */}
                    <div style={{
                        width: '30%',
                        borderRight: '2px solid rgba(255, 215, 0, 0.3)',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)'
                    }}>
                        {mails.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 15px',
                                color: '#888'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📭</div>
                                <div style={{ fontSize: '0.9rem' }}>우편함이 비어있습니다</div>
                            </div>
                        ) : (
                            mails.map((mail) => {
                                const isSelected = selectedMailId === mail.id;

                                return (
                                    <div
                                        key={mail.id}
                                        onClick={() => handleSelectMail(mail.id)}
                                        style={{
                                            padding: '12px',
                                            backgroundColor: isSelected
                                                ? 'rgba(255, 215, 0, 0.2)'
                                                : mail.isRead
                                                    ? 'transparent'
                                                    : 'rgba(255, 215, 0, 0.05)',
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            borderLeft: isSelected ? '4px solid #FFD700' : '4px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.backgroundColor = mail.isRead ? 'transparent' : 'rgba(255, 215, 0, 0.05)';
                                            }
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '8px'
                                        }}>
                                            {!mail.isRead && (
                                                <div style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    backgroundColor: '#ff4444',
                                                    borderRadius: '50%',
                                                    marginTop: '5px',
                                                    flexShrink: 0
                                                }}></div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    color: 'white',
                                                    fontSize: '0.85rem',
                                                    fontWeight: mail.isRead ? 'normal' : 'bold',
                                                    marginBottom: '4px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {mail.title}
                                                </div>
                                                <div style={{
                                                    color: '#888',
                                                    fontSize: '0.65rem'
                                                }}>
                                                    {new Date(mail.createdAt).toLocaleDateString('ko-KR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right: Mail Detail */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {!selectedMail ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#888'
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📧</div>
                                <div style={{ fontSize: '0.9rem' }}>우편을 선택해주세요</div>
                            </div>
                        ) : (
                            <>
                                {/* Scrollable Content */}
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '20px'
                                }}>
                                    {/* Mail Header */}
                                    <div style={{
                                        marginBottom: '15px',
                                        paddingBottom: '12px',
                                        borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <h3 style={{
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            marginBottom: '8px'
                                        }}>
                                            {selectedMail.title}
                                        </h3>
                                        <div style={{
                                            color: '#888',
                                            fontSize: '0.75rem'
                                        }}>
                                            {new Date(selectedMail.createdAt).toLocaleString('ko-KR')}
                                        </div>
                                    </div>

                                    {/* Mail Message */}
                                    <div style={{
                                        color: '#ddd',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedMail.message}
                                    </div>
                                </div>

                                {/* Fixed Bottom: Rewards & Actions */}
                                <div style={{
                                    borderTop: '2px solid rgba(255, 215, 0, 0.3)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    padding: '15px 20px'
                                }}>
                                    {/* Rewards Display */}
                                    {selectedMail.rewards && (selectedMail.rewards.diamond > 0 || selectedMail.rewards.gold > 0) && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            marginBottom: '12px',
                                            color: '#FFD700',
                                            fontSize: '0.85rem'
                                        }}>
                                            <span style={{ fontWeight: 'bold' }}>🎁 보상:</span>
                                            {selectedMail.rewards.diamond > 0 && (
                                                <span style={{ color: '#00bcd4', fontWeight: 'bold' }}>
                                                    💎 {selectedMail.rewards.diamond}
                                                </span>
                                            )}
                                            {selectedMail.rewards.gold > 0 && (
                                                <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
                                                    💰 {selectedMail.rewards.gold}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        justifyContent: 'flex-end'
                                    }}>
                                        {selectedMail.rewards && (selectedMail.rewards.diamond > 0 || selectedMail.rewards.gold > 0) && !selectedMail.isRewardClaimed && (
                                            <button
                                                onClick={() => handleClaimReward(selectedMail.id)}
                                                style={{
                                                    backgroundColor: '#4caf50',
                                                    color: 'white',
                                                    border: '2px solid rgba(255, 255, 255, 0.5)',
                                                    borderRadius: '8px',
                                                    padding: '10px 20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scale(1.05)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                보상 받기
                                            </button>
                                        )}
                                        {selectedMail.isRead && (
                                            !selectedMail.rewards ||
                                            (selectedMail.rewards.diamond === 0 && selectedMail.rewards.gold === 0) ||
                                            selectedMail.isRewardClaimed
                                        ) && (
                                                <button
                                                    onClick={() => handleDelete(selectedMail.id)}
                                                    style={{
                                                        backgroundColor: '#666',
                                                        color: 'white',
                                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '10px 20px',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#ff4444';
                                                        e.target.style.transform = 'scale(1.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#666';
                                                        e.target.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    삭제
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MailboxModal;
