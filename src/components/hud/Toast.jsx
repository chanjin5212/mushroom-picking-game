import React, { useEffect } from 'react';

const Toast = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '15px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            zIndex: 10000,
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            border: '2px solid #ff4444',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {message}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </div>
    );
};

export default Toast;
