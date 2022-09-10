import { Schema, defineTypes } from '@colyseus/schema'
import { ORLOG_SYMBOLS } from '../../utils/constants.js'

export class Player extends Schema {
  constructor() {
    super()
    this.lifeStonesAmount = 15
    this.faithTokensAmount = 0
    this.diceSymbols = [ORLOG_SYMBOLS.AXE, ORLOG_SYMBOLS.SHIELD]
  }
}
defineTypes(Player, {
  lifeStonesAmount: 'number',
  faithTokensAmount: 'number',
  diceSymbols: 'array',
})
