import Experience from '@/Experience'
import { isWithinRange } from '@/Utils/math.js'
import { gsap as g } from 'gsap'

export default class Dice {
  constructor(
    group = null,
    isPlayer = false,
    playerId,
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

    this.isPlayer = isPlayer
    this.playerId = playerId
    this.owner = this.experience.world.players[playerId]
    this.originalOwner = this.experience.world.players[playerId]
    this.midZOffset = 5
    this.offsetDirection = this.isPlayer ? 1 : -1

    this.scale = 0.3
    this.mass = 300
    this.inertia = 13
    this.isPlayingCollisionSound = false

    this.isHighlighted = false
    this.isSelected = false
    this.isMarkedForRemoval = false
    this.isMarkedForSteal = false

    this.group = group
    this.modelNumber = model

    this.position = new THREE.Vector3(
      position.x,
      position.y,
      this.offsetDirection * (this.midZOffset + position.z),
    )
    this.rotation = rotation

    this.resource = this.resources.items[`diceModel${this.modelNumber}`]

    // place dices under the board to hide them from falling before throw
    this.setMesh(
      new THREE.Vector3(
        this.modelNumber * 2,
        -this.modelNumber * 2 - 1000 /* place the dice out of visible sight */,
        this.offsetDirection * (this.modelNumber * 2 + 1),
      ),
    )
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
    this.highlightMesh = outlineMesh
    group.add(outlineMesh)

    return group
  }

  toggleHighlight() {
    // might be wrong
    this.highlightMesh.material.transparent = this.highlightMesh.material.opacity === 0.8
    this.highlightMesh.material.opacity = this.highlightMesh.material.opacity === 0 ? 0.8 : 0
  }

  setMesh(customPosition) {
    this.mesh = this.resource.scene.children[0].clone(true)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.mesh.name = `Dice${this.modelNumber}Mesh-${this.owner.playerId}`
    this.mesh.identifier = 'mainMesh'
    this.mesh.userData.playerId = this.playerId

    const group = this.createSideDetectorCubes(this.mesh)
    this.group = group
    group.scale.set(this.scale, this.scale, this.scale)
    if (customPosition) {
      group.position.copy(customPosition)
    } else {
      group.position.copy(this.position)
    }

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
      // breakable: true,
      // fractureImpulse: 5,
      // collisionFlags: 3,
    })
  }

  setCollisionHandler() {
    this.group.body.on.collision((otherObject, event) => {
      if (this.experience.world?.disableDiceCollisonSound === false && otherObject.name === 'bowl2') {
        if (this.isPlayingCollisionSound === false) {
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
          }, 500)
        }
      }
    })
  }

  toggleDice(doHighLight = false, selection) {
    if (selection !== undefined) {
      this.highlightMesh.isSelected = selection
    } else {
      this.highlightMesh.isSelected = !this.highlightMesh.isSelected
    }
    this.highlightMesh.isHighlighted = doHighLight
  }

  toggleMarkForRemoval() {
    this.highlightMesh.isSelected = !this.highlightMesh.isSelected
    this.isMarkedForRemoval = !this.isMarkedForRemoval
  }

  toggleMarkForSteal() {
    this.highlightMesh.isSelected = !this.highlightMesh.isSelected
    this.isMarkedForSteal = !this.isMarkedForSteal
  }

  changeDieOwner(player) {
    /* switch ownership here */
    this.owner = player
    this.isMarkedForSteal = false

    this.isPlayer = this.owner.isPlayer
    this.playerId = this.owner.playerId
    this.offsetDirection = this.isPlayer ? 1 : -1
    this.mesh.userData.playerId = this.playerId

    this.owner.dicesHandler.dicesList.push(this)

    this.highlightMesh.isPlaced = false
  }

  moveForward() {
    const originalOffsetDirection = this.owner.isPlayer ? -1 : 1
    return g.to(this.group.position, {
      z: this.group.position.z + this.scale * 2.5 * originalOffsetDirection,
      duration: 0.3,
    })
  }
}
