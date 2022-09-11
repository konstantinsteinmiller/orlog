import { disposeMeshAndRemoveFromScene } from '@/Utils/ThreeHelpers.js'
import { gsap as g } from 'gsap'

export default class FaithToken {
  constructor(isPlayer, id = 0, timeoutInMs) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.id = id
    this.scale = 0.25

    const xPosition = 5 - Math.floor(this.id / 15) * 0.8
    const yPosition = 0.05 + Math.floor(this.id % 5) * 0.15
    const zPosition = this.midZOffset + 1.5 - Math.floor(this.id / 5) * 0.8 + Math.floor(this.id / 15) * 2.4
    this.position = new THREE.Vector3(
      this.offsetDirection * xPosition,
      yPosition,
      this.offsetDirection * zPosition,
    )
    this.rotation = new THREE.Vector3(0, 0, 0)

    this.setMesh()

    this.moveFaithTokenToStack(timeoutInMs)
  }

  destroyFaithToken(timeoutInMs) {
    const timeout = timeoutInMs * 0.001
    g.to(this.mesh.position, {
      x: this.offsetDirection * (5.5 - Math.floor(this.id / 5) * 0.8 + Math.floor(this.id / 20) * 3.2),
      y: 2.5,
      z: this.offsetDirection * (this.midZOffset - 0.5 - Math.floor(this.id / 20) * 0.8),
      duration: 0.5,
      delay: timeout * 1.3,
    }).then(() =>
      g
        .to(this.mesh.position, {
          x: this.offsetDirection * (5 - Math.floor(this.id / 15) * 0.8),
          y: 2.5,
          z: this.offsetDirection * this.midZOffset + this.mesh.position.z + this.offsetDirection * 16,
          duration: 1.8,
        })
        .then(() => {
          disposeMeshAndRemoveFromScene(this.mesh, this.scene)
        }),
    )
  }

  moveFaithTokenToStack(timeoutInMs) {
    g.fromTo(
      this.mesh.position,
      {
        x: this.offsetDirection * (5 - Math.floor(this.id / 20) * 0.8),
        y: 2.5,
        z: this.offsetDirection * 16 + this.offsetDirection * 0.5,
        duration: 0.5,
      },
      {
        x: this.offsetDirection * (5.5 - Math.floor(this.id / 5) * 0.8 + Math.floor(this.id / 20) * 3.2),
        y: 2.5,
        z: this.offsetDirection * (this.midZOffset - 0.5 - Math.floor(this.id / 20) * 0.8),
        duration: 0.5,
        delay: timeoutInMs,
      },
    ).then(() =>
      g.to(this.mesh.position, {
        x: this.offsetDirection * (6 - Math.floor(this.id / 5) * 0.8 + Math.floor(this.id / 20) * 3.2),
        y: 0.05 + Math.floor(this.id % 5) * 0.15,
        z: this.offsetDirection * (this.midZOffset - 1.5 - Math.floor(this.id / 20) * 0.8),
        duration: 1.0,
      }),
    )
  }

  setMesh() {
    this.mesh = this.resources.items.faithToken.scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.copy(this.rotation)
    this.scene.add(this.mesh)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  update() {}
}
