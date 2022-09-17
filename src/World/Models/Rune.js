export default class Rune {
  constructor(id, type, isPlayer) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.id = id
    this.type = type
    this.scale = 2.5

    const xPosition = 3.5 + this.id * 2.1
    const zPosition = this.midZOffset + 1

    this.position = new THREE.Vector3(this.offsetDirection * xPosition, 0, this.offsetDirection * zPosition)
    this.rotation = new THREE.Vector3(0, 0, 0)

    this.setMesh()
  }

  setMesh() {
    this.mesh = this.resources.items[this.type].scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.highlightMesh = new THREE.Mesh(
      new THREE.BufferGeometry().copy(this.mesh.geometry),
      new THREE.MeshBasicMaterial({
        color: 0x7a7a00,
        transparent: true,
        opacity: 0,
        // opacity: 0.25,
      }),
    )
    const highlightScale = 1.1
    this.highlightMesh.scale.set(highlightScale, highlightScale, highlightScale)

    this.mesh.add(this.highlightMesh)
    this.scene.add(this.mesh)

    this.mesh.castShadow = true
    // this.mesh.receiveShadow = true
  }
}
