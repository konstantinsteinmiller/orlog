import { DiceManager } from '@/World/dice'
import * as THREE from 'three'
import Dice from '@/World/Models/Dice.js'
import * as CANNON from 'cannon-es'

export default class DicesHandler {
  constructor() {
    this.scene = experience.scene
    this.debug = experience.debug
    this.dicesList = []

    this.createDices()

    // Debug
    if (this.debug.isActive) {
      this.debugFolder = this.debug.ui.addFolder('meshes')
      this.debugFolder.add(this, 'createDices')
    }

    // webgl.onclick = (dices) => this.randomDiceThrow(dices)
  }
  /*randomDiceThrow() {
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
  }*/
  createDices() {
    this.diceGroup = new THREE.Group({ name: 'diceGroup' })
    this.diceGroup.name = 'diceGroup'
    this.dicesList = [
      new Dice(this.diceGroup, 1, new THREE.Vector3(-0.5, 3, 0), new THREE.Vector3(0, 0, 1)),
      new Dice(this.diceGroup, 2, new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, PI * 0.5)),
      new Dice(this.diceGroup, 3, new THREE.Vector3(0.5, 3, 0), new THREE.Vector3(0, 0, PI)),
      new Dice(this.diceGroup, 4, new THREE.Vector3(-0.5, 3, 0.6), new THREE.Vector3(0, 0, PI * 1.5)),
      new Dice(this.diceGroup, 5, new THREE.Vector3(0, 3, 0.6), new THREE.Vector3(PI * 0.5, 0, 0)),
      new Dice(this.diceGroup, 6, new THREE.Vector3(0.5, 3, 0.6), new THREE.Vector3(PI * 0.5, PI, PI * 1.5)),
    ]
    this.scene.add(this.diceGroup)
  }
  update() {
    this.dicesList.forEach((dice) => {
      dice.mesh.position.copy(dice.body.position)
      dice.mesh.quaternion.copy(dice.body.quaternion)
    })
  }
}
