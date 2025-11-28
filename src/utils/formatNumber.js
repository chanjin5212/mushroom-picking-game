export const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';

    // Korean number units (10^4 base system)
    const units = [
        { value: 1e100, name: '무량대수' },
        { value: 1e96, name: '불가사의' },
        { value: 1e92, name: '나유타' },
        { value: 1e88, name: '아승기' },
        { value: 1e84, name: '항하사' },
        { value: 1e80, name: '극' },
        { value: 1e76, name: '재' },
        { value: 1e72, name: '정' },
        { value: 1e68, name: '양' },
        { value: 1e64, name: '구' },
        { value: 1e60, name: '간' },
        { value: 1e56, name: '정' },
        { value: 1e52, name: '재' },
        { value: 1e48, name: '극' },
        { value: 1e44, name: '항하사' },
        { value: 1e40, name: '아승기' },
        { value: 1e36, name: '나유타' },
        { value: 1e32, name: '불가사의' },
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
