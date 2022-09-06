import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import DicesHandler from '@/World/DicesHandler.js'
import Bowl from '@/World/Models/Bowl.js'
import LifeStone from '@/World/Models/LifeStone.js'
import FaithToken from '@/World/Models/FaithToken.js'
// import * as THREE from 'three'

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.debug = experience.debug
    this.sounds = experience.sounds
    this.resources = experience.resources
    this.diceHandler = null
    this.lifeStones = []
    this.bowls = []
    this.physics = experience.physics
    this.isPlayer = true

    const direction = this.isPlayer ? 1 : -1
    this.midZOffset = 5
    this.offsetDirection = direction

    // const axisHelper = new THREE.AxesHelper(3)
    // this.scene.add(axisHelper)

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      this.dicesHandler = new DicesHandler()
      this.environment = new Environment()
      this.bowls.push(new Bowl())
      this.lifeStones = [...Array(15).keys()].map((id) => new LifeStone(id, id * 0.1))
      this.faithTokens = [...Array(22).keys()].map((id) => new FaithToken(id, id * 0.2))

      // Debug
      if (this.debug.isActive) {
        this.debugFolder = this.debug.ui.addFolder('world')
        this.debugFolder.addColor(this.lifeStones[0].highlightMesh.material, 'color').onChange((color) => {
          this.lifeStones[0].highlightMesh.material.color = color
        })
      }

      setTimeout(() => {
        this.destroyLifeStones(4)
      }, 1500)

      setTimeout(() => {
        this.destroyFaithTokens(12)
      }, 5700)
      // setTimeout(() => this.lifeStones.pop().toggleHighlight(), 3000)
      // setTimeout(() => {
      //   this.lifeStones[0].toggleHighlight()
      //   setTimeout(() => this.lifeStones[0].toggleHighlight(), 1000)
      // }, 4000)
    })
  }

  destroyLifeStones(amount) {
    ;[...Array(amount).keys()].forEach((stone, index) => {
      let lifeStone = this.lifeStones.pop()
      lifeStone.destroyLifeStone(1000 + 200 * index)
      lifeStone = null
    })
  }

  destroyFaithTokens(amount) {
    ;[...Array(amount).keys()].forEach((token, index) => {
      let faithToken = this.faithTokens.pop()
      faithToken.destroyFaithToken(200 * index)
      faithToken = null
    })
  }

  update() {
    this.dicesHandler && this.dicesHandler.update()
  }
}
