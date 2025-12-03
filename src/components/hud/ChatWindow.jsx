import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

const ChatWindow = ({ onClose }) => {
    const { state, sendChatMessage } = useGame();
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.chatMessages]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            sendChatMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: 70,
            left: 15,
            width: '300px',
            height: '400px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 15px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    💬 마을 채팅
                </span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0 5px'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {state.chatMessages.length === 0 ? (
                    <div style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center',
                        marginTop: '20px',
                        fontSize: '0.85rem'
                    }}>
                        채팅을 시작해보세요!
                    </div>
                ) : (
                    state.chatMessages.map((msg) => (
                        msg.isSystem ? (
                            // System Message - Center aligned, blue text
                            <div key={msg.id} style={{
                                textAlign: 'center',
                                padding: '6px 10px',
                                margin: '4px 0'
                            }}>
                                <div style={{
                                    color: '#64b5f6',
                                    fontSize: '0.8rem',
                                    fontStyle: 'italic'
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        ) : (
                            // Regular User Message
                            <div key={msg.id} style={{
                                backgroundColor: msg.username === state.user?.username
                                    ? 'rgba(76, 175, 80, 0.2)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                alignSelf: msg.username === state.user?.username ? 'flex-end' : 'flex-start',
                                maxWidth: '80%'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: msg.username === state.user?.username ? '#81c784' : '#64b5f6',
                                    marginBottom: '3px',
                                    fontWeight: 'bold'
                                }}>
                                    {msg.username}
                                </div>
                                <div style={{
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.message}
                                </div>
                            </div>
                        )
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                gap: '8px'
            }}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요..."
                    maxLength={100}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '0.85rem',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
