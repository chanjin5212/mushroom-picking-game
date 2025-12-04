import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PreRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // 메시지가 표시될 때 상단으로 스크롤
    useEffect(() => {
        if (message.text) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [message]);

    // 컴포넌트 마운트 시 body와 root 스타일 변경
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalHeight = document.body.style.height;

        const root = document.getElementById('root');
        const originalRootHeight = root?.style.height;
        const originalRootDisplay = root?.style.display;

        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.height = 'auto';

        if (root) {
            root.style.height = 'auto';
            root.style.display = 'block';
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.height = originalHeight;

            if (root) {
                root.style.height = originalRootHeight || '';
                root.style.display = originalRootDisplay || '';
            }
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        if (!formData.name || !formData.userId || !formData.phone) {
            setMessage({ type: 'error', text: '모든 항목을 입력해주세요!' });
            setIsSubmitting(false);
            return;
        }

        if (!/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
            setMessage({ type: 'error', text: '올바른 전화번호를 입력해주세요!' });
            setIsSubmitting(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('pre_registrations')
                .insert([
                    {
                        name: formData.name,
                        user_id: formData.userId,
                        phone: formData.phone
                    }
                ]);

            if (error) {
                if (error.code === '23505') {
                    setMessage({ type: 'error', text: '이미 등록된 ID입니다!' });
                } else {
                    setMessage({ type: 'error', text: '등록 중 오류가 발생했습니다.' });
                }
            } else {
                setMessage({ type: 'success', text: '사전예약이 완료되었습니다! 🎉' });
                setFormData({ name: '', userId: '', phone: '' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '등록 중 오류가 발생했습니다.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
            <div style={{
                minHeight: '100vh',
                width: '100%',
                background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3b6 100%)',
                padding: '40px 20px',
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '30px',
                    padding: '30px 25px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    margin: '0 auto',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        fontSize: '80px',
                        opacity: 0.1,
                        animation: 'float 3s ease-in-out infinite'
                    }}>🍄</div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '-30px',
                        fontSize: '100px',
                        opacity: 0.1,
                        animation: 'float 4s ease-in-out infinite'
                    }}>🍄</div>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            fontSize: '60px',
                            marginBottom: '10px',
                            animation: 'bounce 2s ease-in-out infinite'
                        }}>🍄</div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#2d5016',
                            margin: '0 0 10px 0'
                        }}>버섯캐기 사전예약</h1>
                        <p style={{
                            color: '#6b8e23',
                            fontSize: '0.95rem',
                            margin: 0
                        }}>지금 등록하고 특별한 혜택을 받으세요!</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2d5016',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                이름
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="홍길동"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #a8e6cf',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6b8e23'}
                                onBlur={(e) => e.target.style.borderColor = '#a8e6cf'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2d5016',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                아이디
                            </label>
                            <input
                                type="text"
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                placeholder="mushroom123"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #a8e6cf',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6b8e23'}
                                onBlur={(e) => e.target.style.borderColor = '#a8e6cf'}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#2d5016',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                전화번호
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="01012345678"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #a8e6cf',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6b8e23'}
                                onBlur={(e) => e.target.style.borderColor = '#a8e6cf'}
                            />
                        </div>

                        {message.text && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                textAlign: 'center',
                                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                                color: message.type === 'success' ? '#155724' : '#721c24',
                                border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: isSubmitting ? '#ccc' : '#6b8e23',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 15px rgba(107, 142, 35, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.target.style.backgroundColor = '#556b2f';
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) {
                                    e.target.style.backgroundColor = '#6b8e23';
                                    e.target.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {isSubmitting ? '등록 중...' : '🍄 사전예약 하기'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        backgroundColor: '#fff9e6',
                        borderRadius: '15px',
                        border: '2px dashed #ffd700'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            color: '#d4a017',
                            margin: '0 0 10px 0',
                            textAlign: 'center'
                        }}>🎁 사전예약 혜택</h3>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '20px',
                            color: '#8b7355',
                            fontSize: '0.85rem',
                            lineHeight: '1.8'
                        }}>
                            <li>다이아몬드 100만개 지급</li>
                        </ul>
                        <p style={{
                            margin: '15px 0 0 0',
                            color: '#d4a017',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            ※ 보상은 게임 오픈 시 우편함에서 확인하세요!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PreRegister;
