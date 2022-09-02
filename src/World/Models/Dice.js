// import * as THREE from 'three'
import Experience from '@/Experience.js'

export const ORLOG_SYMBOLS = {
  AXE: 'AXE',
  HELM: 'HELM',
  ARROW: 'ARROW',
  SHIELD: 'SHIELD',
  HAND: 'HAND',
}
export const diceMap = {
  /* dice model number to side symbol mapping */
  1: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.HELM, isGolden: false },
    front: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: true },
    back: { symbol: ORLOG_SYMBOLS.HAND, isGolden: true },
    right: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
  },
  2: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.HAND, isGolden: true },
    front: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: false },
    back: { symbol: ORLOG_SYMBOLS.HELM, isGolden: false },
    right: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: true },
  },
  3: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.HELM, isGolden: true },
    front: { symbol: ORLOG_SYMBOLS.HAND, isGolden: false },
    back: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: false },
    right: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: true },
  },
  4: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.HELM, isGolden: true },
    front: { symbol: ORLOG_SYMBOLS.HAND, isGolden: true },
    back: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    right: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: false },
  },
  5: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.HELM, isGolden: false },
    front: { symbol: ORLOG_SYMBOLS.HAND, isGolden: false },
    back: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: true },
    right: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: true },
  },
  6: {
    top: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    bottom: { symbol: ORLOG_SYMBOLS.ARROW, isGolden: false },
    front: { symbol: ORLOG_SYMBOLS.HAND, isGolden: false },
    back: { symbol: ORLOG_SYMBOLS.HELM, isGolden: true },
    right: { symbol: ORLOG_SYMBOLS.AXE, isGolden: false },
    left: { symbol: ORLOG_SYMBOLS.SHIELD, isGolden: true },
  },
}

export default class Dice {
  constructor(
    group = null,
    model = 1,
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Vector3(0, 0, 0),
  ) {
    this.experience = new Experience()
    this.physics = this.experience.physics
    this.scene = this.experience.scene
    this.sounds = this.experience.sounds
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

  /* to find the face showing up after throw, we add helper cubes */
  createSideDetectorCubes(mesh) {
    const geometry = new THREE.BoxGeometry(this.scale, this.scale, this.scale)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      // transparent: true,
      // opacity: 0,
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
    return group
  }
  setMesh() {
    this.mesh = this.resource.scene.children[0].clone(true)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    const group = this.createSideDetectorCubes(this.mesh)
    this.group = group
    group.scale.set(this.scale, this.scale, this.scale)
    group.position.copy(this.position)

    // const randomRotationX = Math.random() * PI * 2
    // const randomRotationY = Math.random() * PI * 2
    // const randomRotationZ = Math.random() * PI * 2
    // this.rotation.x += randomRotationX
    // this.rotation.y += randomRotationY
    // this.rotation.z += randomRotationZ
    this.rotation = new THREE.Vector3((PI / 2) * 3 + 0.3, 0, 0)
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
}
