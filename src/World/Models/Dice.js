import Experience from '@/Experience'
import { isWithinRange } from '@/Utils/math.js'

export default class Dice {
  constructor(
    group = null,
    model = 1,
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
  ) {
    this.experience = new Experience()
    this.debug = this.experience.debug
    this.physics = this.experience.physics
    this.scene = this.experience.scene
    this.sounds = this.experience.sounds
    this.resources = this.experience.resources
    this.midZOffset = this.experience.world.midZOffset
    this.offsetDirection = this.experience.world.offsetDirection
    this.scale = 0.3
    this.mass = 300
    this.inertia = 13
    this.isPlayingCollisionSound = false

    // this.isHighlighted = false
    // this.isSelected = false

    this.group = group
    this.modelNumber = model

    this.position = new THREE.Vector3(
      position.x,
      position.y,
      this.offsetDirection * (this.midZOffset - 1) + position.z,
    )
    this.rotation = rotation

    this.resource = this.resources.items[`diceModel${this.modelNumber}`]

    this.setMesh()
    this.setBody()
    this.setCollisionHandler()
  }

  /* to find the face showing up after throw, we add helper cubes */
  createSideDetectorCubes(mesh) {
    const geometry = new THREE.BoxGeometry(this.scale, this.scale, this.scale)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0,
    })

    const cubeSideUp = new THREE.Mesh(geometry, material)
    cubeSideUp.position.set(0, 1.85, 0)
    cubeSideUp.name = 'upSideDetector'
    const cubeSideFront = new THREE.Mesh(geometry, material)
    cubeSideFront.position.set(0, 0, 1.85)
    cubeSideFront.name = 'frontSideDetector'
    const cubeSideRight = new THREE.Mesh(geometry, material)
    cubeSideRight.position.set(1.85, 0, 0)
    cubeSideRight.name = 'rightSideDetector'

    const group = new THREE.Group()
    group.name = 'diceDetectorGroup'
    group.add(mesh)
    group.add(cubeSideUp)
    group.add(cubeSideFront)
    group.add(cubeSideRight)

    /* opaque outline mesh to highlight selection */
    let outlineMesh = new THREE.Mesh(
      mesh.geometry,
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0,
      }),
    )
    outlineMesh.position.copy(mesh.position)
    outlineMesh.scale.multiplyScalar(1.1)
    outlineMesh.name = 'diceHighlight'
    group.add(outlineMesh)

    return group
  }
  setMesh() {
    this.mesh = this.resource.scene.children[0].clone(true)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.name = `Dice${this.modelNumber}Mesh`
    this.mesh.identifier = 'mainMesh'

    const group = this.createSideDetectorCubes(this.mesh)
    this.group = group
    group.scale.set(this.scale, this.scale, this.scale)
    group.position.copy(this.position)

    const randomRotationX = Math.random() * PI * 2
    const randomRotationY = Math.random() * PI * 2
    const randomRotationZ = Math.random() * PI * 2
    this.rotation.x += randomRotationX
    this.rotation.y += randomRotationY
    this.rotation.z += randomRotationZ
    // this.rotation = new THREE.Vector3((PI / 2) * 3 + 0.3, 0, 0)
    group.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)
    this.scene.add(group)
  }

  setBody() {
    this.physics.add.existing(this.group, {
      mass: 300,
      collisionFlags: 0,
      shape: 'box',
      width: 2,
      height: 2,
      depth: 2,
    })
  }

  setCollisionHandler() {
    this.group.body.on.collision((otherObject, event) => {
      if (
        this.experience.world?.dicesHandler?.disableDiceCollisonSound === false &&
        otherObject.name === 'bowl2'
      ) {
        if (!this.isPlayingCollisionSound) {
          this.sounds.playSound(['diceHit1', 'diceHit2', 'diceHit3'], true, 0.2, 0.5)
          this.isPlayingCollisionSound = true
          setTimeout(() => {
            const angularVelocity = new THREE.Vector3(1, 1, 1).dot(
              new THREE.Vector3(
                Math.abs(this.group.body?.angularVelocity.x),
                Math.abs(this.group.body?.angularVelocity.y),
                Math.abs(this.group.body?.angularVelocity.z),
              ),
            )
            const velocity = new THREE.Vector3(1, 1, 1).dot(
              new THREE.Vector3(
                Math.abs(this.group.body?.velocity.x),
                Math.abs(this.group.body?.velocity.y),
                Math.abs(this.group.body?.velocity.z),
              ),
            )
            if (!isWithinRange(angularVelocity, -0.1, 0.1) && !isWithinRange(velocity, -0.1, 0.1)) {
              this.isPlayingCollisionSound = false
            }
          }, 300)
        }
      }
    })
  }
}
