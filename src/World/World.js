import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import DicesHandler from '@/World/DicesHandler.js'
import Bowl from '@/World/Models/Bowl.js'
// import * as THREE from 'three'

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.debug = experience.debug
    this.sounds = experience.sounds
    this.resources = experience.resources
    this.diceHandler = null
    this.bowls = []
    this.physics = experience.physics

    // const axisHelper = new THREE.AxesHelper(3)
    // this.scene.add(axisHelper)

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      this.dicesHandler = new DicesHandler()
      this.environment = new Environment()
      this.bowls.push(new Bowl())

      // Debug
      if (this.debug.isActive) {
        this.debugFolder = this.debug.ui.addFolder('meshes')
      }
    })
  }

  update() {
    if (this.physics) {
      // this.physics.step(1 / 60, experience.time.delta, 3)
      // this.dicesHandler && this.dicesHandler.update()
    }
    // const { factory } = this.physics
    // this.physics.add.box({ x: 0.05, y: 10, mass: 1 }, { lambert: { color: 0x2194ce } })
    //
    // // static ground
    // let greenSphere = factory.addSphere({ y: 2, z: 5 }, { lambert: { color: 0x00ff00 } })
  }
}
