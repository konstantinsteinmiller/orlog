import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import DicesHandler from '@/World/DicesHandler.js'
import Bowl from '@/World/Models/Bowl.js'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from '@/Utils/CannonDebug'

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.debug = experience.debug
    this.sounds = experience.sounds
    this.resources = experience.resources
    this.diceHandler = null
    this.dices = []
    this.bowls = []
    this.physicsWorld = new CANNON.World()

    this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.physicsWorld)

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      this.dicesHandler = new DicesHandler()
      this.environment = new Environment()
      this.bowls.push(new Bowl())
      this.setPhysicsWorld()

      // Debug
      if (this.debug.isActive) {
        this.debugFolder = this.debug.ui.addFolder('meshes')
      }
    })
  }

  setPhysicsWorld() {
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld) // advanced collision detection, NAIVE is default
    this.physicsWorld.allowSleep = true
    this.physicsWorld.gravity.set(0, -9.82, 0)

    const defaultMaterial = new CANNON.Material('default')
    const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
      friction: 0.1,
      restitution: 0.7,
    })
    this.physicsWorld.addContactMaterial(defaultContactMaterial)
    this.physicsWorld.defaultContactMaterial = defaultContactMaterial
  }

  update() {
    if (this.physicsWorld) {
      this.physicsWorld.step(1 / 60, experience.time.delta, 3)

      this.dicesHandler && this.dicesHandler.update()
      this.cannonDebugRenderer.update()
    }
  }
}
