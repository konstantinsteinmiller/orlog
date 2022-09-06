// import * as THREE from 'three'

export default class Bowl {
  constructor(position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Vector3(0, 0, 0)) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.midZOffset = this.experience.world.midZOffset
    this.offsetDirection = this.experience.world.offsetDirection

    this.position = position
    this.rotation = rotation
    this.scale = 1

    this.setMesh()
    this.setBody()
  }
  update() {}

  setMesh() {
    this.mesh = this.resources.items['bowl'].scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.position.z += this.offsetDirection * (this.midZOffset - 1)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)

    this.scene.add(this.mesh)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  setBody() {
    const compound = [
      { shape: 'box', width: 3.8, height: 0.1, depth: 3.8, x: 0, y: 0, z: 0 },
      { shape: 'box', width: 3.8, height: 1.1, depth: 0.15, x: 0, y: 0.7, z: 1.925 },
      { shape: 'box', width: 3.8, height: 1.1, depth: 0.15, x: 0, y: 0.7, z: -1.925 },
      { shape: 'box', width: 0.15, height: 1.1, depth: 3.8, x: -1.925, y: 0.7, z: 0 },
      { shape: 'box', width: 0.15, height: 1.1, depth: 3.8, x: 1.925, y: 0.7, z: 0 },
    ]
    this.physics.add.existing(this.mesh, { collisionFlags: 1, compound })
  }
}
