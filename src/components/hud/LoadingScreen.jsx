import React from 'react';

const LoadingScreen = () => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#3e2723', // Dark brown background
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            color: 'white'
        }}>
            <div style={{ fontSize: '50px', marginBottom: '20px', animation: 'bounce 1s infinite' }}>
                🍄
            </div>
            <h2 style={{ fontFamily: 'monospace' }}>Loading...</h2>
            <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
