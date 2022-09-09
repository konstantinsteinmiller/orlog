import { Schema, defineTypes } from '@colyseus/schema'

export class Player extends Schema {
  constructor() {
    super()
    this.x = 0.11
    this.y = 2.22
  }
}
defineTypes(Player, {
  x: 'number',
  y: 'number',
})
