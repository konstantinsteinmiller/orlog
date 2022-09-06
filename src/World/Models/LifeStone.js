export default class LifeStone {
  constructor(id = 0) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.position = new THREE.Vector3(-6, 0, 1.5)
    this.rotation = new THREE.Vector3(0, 0, 0)
    this.id = id
    this.modelNumber = Math.floor(Math.random() * 4)
    this.scale = 0.25

    this.setMesh()
  }

  setMesh() {
    this.mesh = this.resources.items.lifeStones.scene.children[this.modelNumber].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    // this.position.y += 0.5
    const zPosition = 1.5 - Math.floor(this.id / 5)
    const xPosition = -6 + (this.id % 5) * 0.7
    this.mesh.position.set(xPosition, 0, zPosition)
    this.mesh.rotation.set(this.rotation.x, Math.random() - 0.5, this.rotation.z)

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

  update() {}
}
