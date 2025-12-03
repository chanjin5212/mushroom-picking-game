import React, { useRef, useState } from 'react';

const Joystick = ({ onMove }) => {
    const stickRef = useRef(null);
    const baseRef = useRef(null);
    const [touchId, setTouchId] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleStart = (e) => {
        // e.preventDefault(); // Mouse events don't need preventDefault usually, but touch does
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        setTouchId(e.touches ? e.touches[0].identifier : 'mouse');
        updatePosition(clientX, clientY);
    };

    const handleMove = (e) => {
        if (touchId === null) return;
        // e.preventDefault();

        const clientX = e.touches ? Array.from(e.changedTouches).find(t => t.identifier === touchId)?.clientX : e.clientX;
        const clientY = e.touches ? Array.from(e.changedTouches).find(t => t.identifier === touchId)?.clientY : e.clientY;

        if (clientX !== undefined) {
            updatePosition(clientX, clientY);
        }
    };

    const handleEnd = (e) => {
        // e.preventDefault();
        setTouchId(null);
        setPosition({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
    };

    const updatePosition = (clientX, clientY) => {
        if (!baseRef.current) return;

        const baseRect = baseRef.current.getBoundingClientRect();
        const centerX = baseRect.left + baseRect.width / 2;
        const centerY = baseRect.top + baseRect.height / 2;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);
        const maxDist = baseRect.width / 2;

        const angle = Math.atan2(deltaY, deltaX);
        const clampedDist = Math.min(distance, maxDist);

        const x = Math.cos(angle) * clampedDist;
        const y = Math.sin(angle) * clampedDist;

        setPosition({ x, y });
        onMove({ x: x / maxDist, y: y / maxDist });
    }

    return (
        <div
            ref={baseRef}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                width: '120px',
                height: '120px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                backdropFilter: 'blur(5px)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                zIndex: 100,
                touchAction: 'none',
                cursor: 'pointer'
            }}
        >
            <div
                ref={stickRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
            />
        </div>
    );
};

export default Joystick;
