export const dotProduct = (a, b) => a.reduce((acc, n, i) => acc + n * b[i], 0)

export const isWithinRange = (value, min, max) => value >= min && value <= max
