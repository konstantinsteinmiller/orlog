import * as THREE from 'three'
import Experience from '@/Experience.js'
import * as CANNON from 'cannon-es'
// import { CreateConvexPolyhedron } from '@/Utils/CannonUtils'

export default class Dice {
  constructor(
    group = null,
    model = 1,
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
  ) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sounds = this.experience.sounds
    this.physicsWorld = this.experience.world.physicsWorld
    this.resources = this.experience.resources
    this.scale = 0.2
    this.mass = 300
    this.inertia = 13

    this.group = group
    this.modelNumber = model
    this.position = position
    this.rotation = rotation

    this.resource = this.resources.items[`diceModel${this.modelNumber}`]

    this.setMesh()
    this.setBody()
  }

  setMesh() {
    this.mesh = this.resource.scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)

    const randomRotationX = Math.random() * PI * 2
    const randomRotationY = Math.random() * PI * 2
    const randomRotationZ = Math.random() * PI * 2
    this.rotation.x += randomRotationX
    this.rotation.y += randomRotationY
    this.rotation.z += randomRotationZ
    // console.log('this.mesh.: ', JSON.parse(JSON.stringify(this.mesh.quaternion)))
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
    // console.log('this.mesh.: ', JSON.parse(JSON.stringify(this.mesh.quaternion)))

    if (this.group === null) {
      this.scene.add(this.mesh)
    } else {
      this.group.add(this.mesh)
    }

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }

  setBody() {
    // Cannon body
    const diceShape = new CANNON.Box(new CANNON.Vec3(this.scale, this.scale, this.scale))
    const shape = new CANNON.Box(new CANNON.Vec3(1))
    this.body = new CANNON.Body({
      mass: 1,
      shape: diceShape,
      material: new CANNON.Material('default'),
    })
    this.body.position.copy(this.mesh.position)
    this.body.quaternion.copy(this.mesh.quaternion)
    // console.log('this.body: ', this.body.quaternion)
    this.body.addEventListener('collide', (event) => this.sounds.playHitSound(event))
    this.physicsWorld.addBody(this.body)
    // this.model.body.linearDamping = 0.3
    // this.model.body.angularDamping = 0.3
    // this.model.body.position.set(position)
    // this.model.body.quaternion.setFromEuler(rotation)
  }
}
