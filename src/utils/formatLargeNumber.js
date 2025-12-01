// Format large numbers to show only top 2 units
// Example: 10,123,456,789,012 -> "10조 1234억"
// Example: 5,234,567,890,123,456 -> "523경 4567조"

const units = [
    { value: 10000000000000000n, name: '경' },  // 10^16
    { value: 1000000000000n, name: '조' },      // 10^12
    { value: 100000000n, name: '억' },          // 10^8
    { value: 10000n, name: '만' }               // 10^4
];

export const formatLargeNumber = (num) => {
    if (num === 0) return '0';
    if (num < 10000) return num.toLocaleString();

    // Convert to BigInt for large number handling
    const bigNum = BigInt(Math.floor(num));

    // Find the largest applicable unit
    for (let i = 0; i < units.length; i++) {
        if (bigNum >= units[i].value) {
            const firstUnit = units[i];
            const firstValue = bigNum / firstUnit.value;
            const remainder = bigNum % firstUnit.value;

            // Check if there's a second unit
            if (i + 1 < units.length && remainder >= units[i + 1].value) {
                const secondUnit = units[i + 1];
                const secondValue = remainder / secondUnit.value;
                return `${firstValue}${firstUnit.name} ${secondValue}${secondUnit.name}`;
            }

            return `${firstValue}${firstUnit.name}`;
        }
    }

    return num.toLocaleString();
};

// Format with full number display (for diamonds)
export const formatFullNumber = (num) => {
    return num.toLocaleString();
};
