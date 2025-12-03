import React from 'react';
import StatItem from './StatItem';

const CriticalSection = ({
    tierName,
    color,
    isUnlocked,
    unlockMessage,
    chanceStat,
    damageStat,
    startHold,
    stopHold,
    gold
}) => {
    // Helper to convert hex to rgb for gradient
    const hexToRgb = (hex) => {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    const rgb = hexToRgb(color);

    return (
        <>
            {/* Header */}
            <div style={{
                textAlign: 'center',
                padding: '10px',
                background: isUnlocked
                    ? `linear-gradient(90deg, ${color}, rgba(${rgb}, 0.5))`
                    : 'rgba(100,100,100,0.3)',
                borderRadius: '8px',
                fontWeight: 'bold',
                marginBottom: '10px',
                opacity: isUnlocked ? 1 : 0.5,
                color: 'white',
                boxShadow: isUnlocked ? `0 0 10px ${color}` : 'none'
            }}>
                {isUnlocked ? `⚡ ${tierName} 크리티컬 해제됨 ⚡` : `🔒 ${tierName} 크리티컬 (${unlockMessage})`}
            </div>

            {/* Chance Stat */}
            <StatItem
                label={`${tierName} 치명타 확률`}
                value={chanceStat.value}
                level={chanceStat.level}
                maxLevel={chanceStat.maxLevel}
                cost={chanceStat.info.totalCost}
                validCount={chanceStat.info.validCount * 0.1} // Display value for chance is usually 0.1 per level
                canUpgrade={gold >= chanceStat.info.totalCost && chanceStat.info.validCount > 0}
                onUpgrade={chanceStat.onUpgrade}
                startHold={startHold}
                stopHold={stopHold}
                isLocked={!isUnlocked}
                renderValue={(v) => `현재: ${v.toFixed(1)}% (최대 100%)`}
                color={color}
                icon="⚡"
            />

            {/* Damage Stat */}
            <StatItem
                label={`${tierName} 치명타 데미지`}
                value={damageStat.value}
                level={damageStat.level}
                maxLevel={damageStat.maxLevel}
                cost={damageStat.info.totalCost}
                validCount={damageStat.info.validCount}
                canUpgrade={gold >= damageStat.info.totalCost && damageStat.info.validCount > 0}
                onUpgrade={damageStat.onUpgrade}
                startHold={startHold}
                stopHold={stopHold}
                isLocked={!isUnlocked}
                renderValue={(v) => `레벨: ${damageStat.level}/${damageStat.maxLevel} (${v}%)`}
                color={color}
                icon="💥"
            />
        </>
    );
};

export default CriticalSection;
