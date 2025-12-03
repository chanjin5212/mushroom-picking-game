// Helper to generate unit names: A, B, ..., Z, AA, AB, ...
const getUnitName = (index) => {
    let name = '';
    let i = index;

    do {
        const remainder = i % 26;
        name = String.fromCharCode(65 + remainder) + name;
        i = Math.floor(i / 26) - 1;
    } while (i >= 0);

    return name;
};

// Common formatting logic
const formatWithUnit = (num) => {
    if (num === undefined || num === null) return '0';
    if (typeof num !== 'number') num = Number(num);
    if (isNaN(num)) return '0';

    // Less than 10,000: Show raw number with commas
    if (num < 10000) return num.toLocaleString();

    // Calculate exponent and unit index
    // 10^4 -> Index 0 (A)
    // 10^8 -> Index 1 (B)
    const exponent = Math.floor(Math.log10(num));
    const unitIndex = Math.floor((exponent - 4) / 4);

    // Calculate divisor: 10^(4 * (unitIndex + 1))
    const divisor = Math.pow(10, 4 * (unitIndex + 1));

    const value = num / divisor;
    const unitName = getUnitName(unitIndex);

    // Check if integer to avoid unnecessary decimals
    if (Number.isInteger(value)) {
        return `${value}${unitName}`;
    }

    // Show up to 2 decimal places
    return `${value.toFixed(2)}${unitName}`;
};

export const formatNumber = (num) => {
    return formatWithUnit(num);
};

export const formatDamage = (num) => {
    return formatWithUnit(num);
};
