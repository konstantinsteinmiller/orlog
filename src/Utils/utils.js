import { GAME_SYMBOLS, GAME_SYMBOLS_ORDER } from '@/Utils/constants.js'
import { isWithinRange } from '@/Utils/math.js'

export const isDev = import.meta.env.MODE === 'development'

export const sortByUpwardSymbol = (a, b) => {
  if (GAME_SYMBOLS_ORDER[a.mesh.userData.upwardSymbol] < GAME_SYMBOLS_ORDER[b.mesh.userData.upwardSymbol]) {
    return -1
  } else if (
    GAME_SYMBOLS_ORDER[a.mesh.userData.upwardSymbol] > GAME_SYMBOLS_ORDER[b.mesh.userData.upwardSymbol]
  ) {
    return 1
  }
  return 0
}

export const groupBySymbol = (listOfList) => (dice) => {
  dice.mesh.userData?.upwardSymbol === GAME_SYMBOLS.AXE && listOfList[0].push(dice)
  dice.mesh.userData?.upwardSymbol === GAME_SYMBOLS.ARROW && listOfList[1].push(dice)
  dice.mesh.userData?.upwardSymbol === GAME_SYMBOLS.HELM && listOfList[2].push(dice)
  dice.mesh.userData?.upwardSymbol === GAME_SYMBOLS.SHIELD && listOfList[3].push(dice)
  dice.mesh.userData?.upwardSymbol === GAME_SYMBOLS.HAND && listOfList[4].push(dice)
  return true
}

export const isDicePlanarRotated = (dice) =>
  isWithinRange(Math.abs(dice.group.rotation.x) % Math.PI, Math.PI - 0.1, Math.PI + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.x) % Math.PI, Math.PI / 2 - 0.1, Math.PI / 2 + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.x) % Math.PI, -0.1, +0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.y) % Math.PI, Math.PI - 0.1, Math.PI + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.y) % Math.PI, Math.PI / 2 - 0.1, Math.PI / 2 + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.y) % Math.PI, -0.1, +0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.z) % Math.PI, Math.PI - 0.1, Math.PI + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.z) % Math.PI, Math.PI / 2 - 0.1, Math.PI / 2 + 0.1) ||
  isWithinRange(Math.abs(dice.group.rotation.z) % Math.PI, -0.1, +0.1)
