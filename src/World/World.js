import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import Dice from '@/World/Models/Dice.js'
import DicesHandler from '@/World/DicesHandler.js'
import { DiceManager, DiceOrlog } from '@/World/dice'
import * as THREE from 'three'
import * as CANNON from 'cannon'

const PI = Math.PI

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.resources = experience.resources
    this.diceHandler = null
    this.dices = []

    this.physicsWorld = new CANNON.World()

    // Wait for resources
    this.resources.on('ready', () => {
      // Setup
      this.floor = new Floor()
      // DiceManager.setWorld(this.physicsWorld)

      this.diceGroup = new THREE.Group({ name: 'diceGroup' })
      this.diceGroup.name = 'diceGroup'
      this.dices = [
        new Dice(this.diceGroup, 1, new THREE.Vector3(-0.5, 0.2, 0), new THREE.Vector3(0, 0, 0)),
        new Dice(this.diceGroup, 2, new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0, 0, PI * 0.5)),
        new Dice(this.diceGroup, 3, new THREE.Vector3(0.5, 0.2, 0), new THREE.Vector3(0, 0, PI)),
        new Dice(this.diceGroup, 4, new THREE.Vector3(-0.5, 0.2, 0.6), new THREE.Vector3(0, 0, PI * 1.5)),
        new Dice(this.diceGroup, 5, new THREE.Vector3(0, 0.2, 0.6), new THREE.Vector3(PI * 0.5, 0, 0)),
        new Dice(
          this.diceGroup,
          6,
          new THREE.Vector3(0.5, 0.2, 0.6),
          new THREE.Vector3(PI * 0.5, PI, PI * 1.5),
        ),
      ]
      this.scene.add(this.diceGroup)
      /* for (var i = 0; i < 5; i++) {
        var die = new DiceOrlog({
          size: 1.5,
          backColor: '#000',
          fontColor: '#fff',
        })
        this.scene.add(die.getObject())
        this.dices.push(die)
      }*/

      this.environment = new Environment()
      // this.setPhysicsWorld()
      // this.dicesHandler = new DicesHandler(this.dices)
    })
  }

  setPhysicsWorld() {
    this.physicsWorld.gravity.set(0, -9.82 * 20, 0)
    this.physicsWorld.broadphase = new CANNON.NaiveBroadphase()
    this.physicsWorld.solver.iterations = 16

    // this.dices.forEach((dice) => {
    // dice.setBody(dice.group, dice.position, dice.rotation)
    // })
  }

  update() {
    // if (this.dice) {
    // this.dice.update()
    // }
    // console.log('this.physicsWorld: ', this.physicsWorld)
    // if (this.physicsWorld) {
    //   this.physicsWorld.step(1 / 60, this.experience.time.delta, 3)
    //
    //   this.dices.forEach((dice) => {
    //     dice.updateMeshFromBody()
    //   })
    // }
  }
}
