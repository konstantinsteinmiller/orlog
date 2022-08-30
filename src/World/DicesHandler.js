import { DiceManager } from '@/World/dice'

export default class DicesHandler {
  constructor(dices) {
    this.dices = dices
    console.log('dices: ', dices)

    webgl.onclick = (dices) => this.randomDiceThrow(dices)
  }
  randomDiceThrow() {
    var diceValues = []
    console.log('randomDiceThrow: ', this.dices)
    for (var i = 0; i < this.dices.length; i++) {
      let yRand = Math.random() * 20 + 2
      this.dices[i].getObject().position.x = -15 - (i % 3) * 1.5
      this.dices[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5
      this.dices[i].getObject().position.z = -15 + (i % 3) * 1.5
      this.dices[i].getObject().quaternion.x = ((Math.random() * 90 - 45) * Math.PI) / 180
      this.dices[i].getObject().quaternion.z = ((Math.random() * 90 - 45) * Math.PI) / 180
      this.dices[i].updateBodyFromMesh()
      let rand = Math.random() * 5
      this.dices[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand)
      this.dices[i]
        .getObject()
        .body.angularVelocity.set(20 * Math.random() - 10, 20 * Math.random() - 10, 20 * Math.random() - 10)

      diceValues.push({ dice: this.dices[i], value: i + 1 })
    }

    DiceManager.prepareValues(diceValues)
  }
  update() {}
}
