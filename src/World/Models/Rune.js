export default class Rune {
  constructor(id, type, isPlayer, player) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.isPlayer = isPlayer
    this.owner = player
    this.instance = this
    this.id = id
    this.type = type
    this.scale = 2.5
    this.isHighlighted = false
    this.isSelected = false

    const xPosition = 3.5 + this.id * 2.1
    const zPosition = this.midZOffset + 1

    this.position = new THREE.Vector3(this.offsetDirection * xPosition, 0, this.offsetDirection * zPosition)
    this.rotation = new THREE.Vector3(0, isPlayer ? 0 : Math.PI, 0)

    this.setMesh()
  }

  setMesh() {
    this.mesh = this.resources.items[this.type].scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.set(...this.rotation)
    this.mesh.name = `${this.type}`
    this.mesh.identifier = 'rune'
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

    this.mesh.instance = this.instance
    this.mesh.castShadow = true
    // this.mesh.receiveShadow = true
  }

  toggleRune(doHighLight = false, isSelected) {
    if (isSelected !== undefined) {
      this.isSelected = isSelected
    } else {
      this.isSelected = !this.isSelected
    }
    this.isHighlighted = doHighLight
    this.highlightMesh.material.opacity = isSelected ? 0.3 : this.isHighlighted ? 0.4 : 0
    this.highlightMesh.material.color.set(isSelected ? 0x00ff00 : 0x7a7a00)
  }
}
