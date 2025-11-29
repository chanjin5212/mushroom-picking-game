export const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    if (typeof num !== 'number') num = Number(num);
    if (isNaN(num)) return '0';

    // Korean number units (10^4 base system)
    const units = [
        { value: 1e68, name: '무량대수' },
        { value: 1e64, name: '불가사의' },
        { value: 1e60, name: '나유타' },
        { value: 1e56, name: '아승기' },
        { value: 1e52, name: '항하사' },
        { value: 1e48, name: '극' },
        { value: 1e44, name: '재' },
        { value: 1e40, name: '정' },
        { value: 1e36, name: '간' },
        { value: 1e32, name: '구' },
        { value: 1e28, name: '양' },
        { value: 1e24, name: '자' },
        { value: 1e20, name: '해' },
        { value: 1e16, name: '경' },
        { value: 1e12, name: '조' },
        { value: 1e8, name: '억' },
        { value: 1e4, name: '만' },
        { value: 1e3, name: '천' }
    ];

    // Find the appropriate unit
    for (let unit of units) {
        if (num >= unit.value) {
            const value = num / unit.value;
            // Show one decimal place if less than 10, otherwise show integer
            if (value < 10) {
                return value.toFixed(1).replace(/\.0$/, '') + unit.name;
            } else {
                return Math.floor(value) + unit.name;
            }
        }
    }

    // For numbers less than 1000, use locale string
    return num.toLocaleString();
};

export const formatDamage = (num) => {
    if (num === undefined || num === null) return '0';
    if (typeof num !== 'number') num = Number(num);
    if (isNaN(num)) return '0';

    if (num < 10000) return num.toLocaleString();

    // Korean number units (10^4 base system)
    const units = [
        { value: 1e68, name: '무량대수' },
        { value: 1e64, name: '불가사의' },
        { value: 1e60, name: '나유타' },
        { value: 1e56, name: '아승기' },
        { value: 1e52, name: '항하사' },
        { value: 1e48, name: '극' },
        { value: 1e44, name: '재' },
        { value: 1e40, name: '정' },
        { value: 1e36, name: '간' },
        { value: 1e32, name: '구' },
        { value: 1e28, name: '양' },
        { value: 1e24, name: '자' },
        { value: 1e20, name: '해' },
        { value: 1e16, name: '경' },
        { value: 1e12, name: '조' },
        { value: 1e8, name: '억' },
        { value: 1e4, name: '만' }
    ];

    for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        if (num >= unit.value) {
            const mainValue = Math.floor(num / unit.value);
            const remainder = num % unit.value;

            // Find the next unit for the remainder
            const nextUnit = units[i + 1];
            let subValue = 0;
            let subUnitName = '';

            if (nextUnit) {
                subValue = Math.floor(remainder / nextUnit.value);
                subUnitName = nextUnit.name;
            } else {
                // If current unit is '만', the remainder is just the number below 10000
                subValue = Math.floor(remainder);
                subUnitName = '';
            }

            if (subValue > 0) {
                return `${mainValue}${unit.name}${subValue}${subUnitName}`.trim();
            } else {
                return `${mainValue}${unit.name}`;
            }
        }
    }

    return num.toLocaleString();
};
