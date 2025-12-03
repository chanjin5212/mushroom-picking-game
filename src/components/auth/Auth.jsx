import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

const Auth = () => {
    const { login, signup, isLoading } = useGame();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await signup(username, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            color: 'white'
        }}>
            <div style={{
                backgroundColor: '#2a2a2a',
                padding: '2rem',
                borderRadius: '10px',
                width: '300px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    {isLogin ? '로그인' : '회원가입'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white' }}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white' }}
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white' }}
                        />
                    )}

                    {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '0.7rem',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'wait' : 'pointer',
                            fontSize: '1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {isLoading ? '처리중...' : (isLogin ? '로그인' : '가입하기')}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#aaa' }}>
                        {isLogin ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
                    </span>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setUsername('');
                            setPassword('');
                            setConfirmPassword('');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#4CAF50',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? '회원가입' : '로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
