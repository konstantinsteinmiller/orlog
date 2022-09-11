import { disposeMeshAndRemoveFromScene } from '@/Utils/ThreeHelpers.js'
import { gsap as g } from 'gsap'

export default class LifeStone {
  constructor(isPlayer = false, id = 0, timeoutInMs = 0) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.id = id
    this.modelNumber = Math.floor(Math.random() * 4)
    this.scale = 0.25

    const xPosition = -6 + (this.id % 5) * 0.7
    const zPosition = this.midZOffset + 1.5 - Math.floor(this.id / 5)

    this.position = new THREE.Vector3(this.offsetDirection * xPosition, 0, this.offsetDirection * zPosition)
    this.rotation = new THREE.Vector3(0, 0, 0)

    this.setMesh()

    this.moveLifeStoneToField(timeoutInMs)
  }

  destroyLifeStone(timeoutInMs) {
    const timeout = timeoutInMs * 0.001
    this.toggleHighlight()
    g.to(this.mesh.position, {
      x: this.offsetDirection * (-6 + 2.1),
      y: 2.5,
      z: this.offsetDirection * this.midZOffset + this.mesh.position.z + this.offsetDirection * 12,
      duration: 1.8,
      delay: timeout,
    }).then(() => {
      this.mesh.remove(this.highlightMesh)

      disposeMeshAndRemoveFromScene(this.highlightMesh, this.mesh)
      disposeMeshAndRemoveFromScene(this.mesh, this.scene)
    })
  }

  moveLifeStoneToField(timeoutInMs) {
    g.fromTo(
      this.mesh.position,
      {
        x: this.offsetDirection * (-this.midZOffset - 3 + (this.id % 5) * 0.7),
        y: 0.05 + Math.floor(this.id % 5) * 0.15,
        z: this.offsetDirection * 15,
        duration: 0.5,
      },
      {
        x: this.offsetDirection * (-this.midZOffset - 1 + (this.id % 5) * 0.7),
        y: 0.05 + Math.floor(this.id % 5) * 0.15,
        z: this.mesh.position.z + this.offsetDirection * 0.5,
        duration: 0.5,
        delay: timeoutInMs,
      },
    ).then(() =>
      g.to(this.mesh.position, {
        x: this.offsetDirection * (-6 + (this.id % 5) * 0.7),
        y: 0,
        z: this.offsetDirection * (this.midZOffset + 1.5 - Math.floor(this.id / 5)),
        duration: 1.0,
      }),
    )
  }

  toggleHighlight() {
    this.highlightMesh.material.transparent = this.highlightMesh.material.opacity === 0.8
    this.highlightMesh.material.opacity = this.highlightMesh.material.opacity === 0 ? 0.8 : 0
  }

  setMesh() {
    this.mesh = this.resources.items.lifeStones.scene.children[this.modelNumber].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.set(this.rotation.x, Math.random() - 0.5, this.rotation.z)
    this.highlightMesh = new THREE.Mesh(
      new THREE.BufferGeometry().copy(this.mesh.geometry),
      new THREE.MeshBasicMaterial({
        color: 0x7a0000,
        transparent: true,
        opacity: 0,
        // opacity: 0.8,
      }),
    )
    const highlightScale = 1.1
    this.highlightMesh.scale.set(highlightScale, highlightScale, highlightScale)

    this.mesh.add(this.highlightMesh)
    this.scene.add(this.mesh)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  update() {}
}
