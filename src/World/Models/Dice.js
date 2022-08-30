import * as THREE from 'three'
import Experience from '@/Experience.js'
import * as CANNON from 'cannon'
import { DiceManager } from '@/World/dice'

export default class Dice {
  constructor(
    group = null,
    model = 1,
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
  ) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.scale = 0.2
    this.mass = 300
    this.inertia = 13

    this.group = group
    this.modelNumber = model
    this.position = position
    this.rotation = rotation
    // this.diceGroup.name = group

    this.resource = this.resources.items[`diceModel${this.modelNumber}`]
    this.setModel()
  }

  setModel() {
    this.model = this.resource.scene.clone(true)

    this.model.scale.set(this.scale, this.scale, this.scale)
    this.model.position.set(this.position.x, this.position.y, this.position.z)
    this.model.rotation.set(this.position.x, this.position.y, this.position.z)

    if (this.group === null) {
      this.scene.add(this.model)
    } else {
      this.group.add(this.model)
    }

    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }

  setBody(group, position, rotation) {
    // this.model.body = new CANNON.Body({
    //   mass: this.mass,
    //   shape: new CANNON.Box(new CANNON.Vec3(0.2)),
    //   material: new CANNON.Material(),
    // })
    // this.model.body.linearDamping = 0.3
    // this.model.body.angularDamping = 0.3
    // this.model.body.position.set(position)
    // this.model.body.quaternion.setFromEuler(rotation)
    //
    // DiceManager.world.addBody(this.model.body)
  }
}
