export const dotProduct = (a, b) => a.reduce((acc, n, i) => acc + n * b[i], 0)

export const isWithinRange = (value, min, max) => value >= min && value <= max

export const getShortestRadAngle = (value) =>
  value > Math.PI ? value - Math.PI * 2 : value < -Math.PI ? value + Math.PI * 2 : value
