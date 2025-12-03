import React from 'react';
import { formatNumber } from '../../../utils/formatNumber';

const StatItem = ({
    label,
    value,
    level,
    maxLevel,
    cost,
    validCount,
    canUpgrade,
    onUpgrade,
    startHold,
    stopHold,
    isLocked = false,
    renderValue,
    color = '#2196f3', // Default blue
    icon // Optional icon
}) => {
    const isMaxLevel = level >= maxLevel;

    return (
        <div style={{
            backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`,
            padding: '15px',
            borderRadius: '10px',
            border: `1px solid rgba(${hexToRgb(color)}, 0.3)`,
            opacity: isLocked ? 0.5 : 1,
            position: 'relative'
        }}>
            {isLocked && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    zIndex: 10
                }}>
                    🔒
                </div>
            )}
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: color }}>
                    {icon} {label}
                </span>
                <span style={{ color: '#fff' }}>
                    {renderValue ? renderValue(value) : value}
                </span>
            </div>
            <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#aaa' }}>
                레벨: {level} / {maxLevel}
            </div>
            {!isMaxLevel ? (
                <button
                    onMouseDown={() => startHold(onUpgrade)}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={() => startHold(onUpgrade)}
                    onTouchEnd={stopHold}
                    disabled={!canUpgrade || isLocked}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: canUpgrade && !isLocked ? color : '#555',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: canUpgrade && !isLocked ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>강화 (+{typeof validCount === 'number' && validCount % 1 !== 0 ? validCount.toFixed(1) : validCount})</span>
                    <span style={{ color: '#ffeb3b' }}>{formatNumber(cost)} G</span>
                </button>
            ) : (
                <div style={{ textAlign: 'center', color: color, fontWeight: 'bold' }}>최대 레벨</div>
            )}
        </div>
    );
};

// Helper to convert hex to rgb for rgba usage
const hexToRgb = (hex) => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

export default StatItem;
