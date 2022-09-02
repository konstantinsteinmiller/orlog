'use strict'
import * as CANNON from 'cannon'
// import * as THREE from 'three'

class DiceManagerClass {
  constructor() {
    this.world = null
  }

  setWorld(world) {
    this.world = world
    // console.log('this.world: ', this.world)

    this.diceBodyMaterial = new CANNON.Material()
    this.floorBodyMaterial = new CANNON.Material()
    this.barrierBodyMaterial = new CANNON.Material()

    world.addContactMaterial(
      new CANNON.ContactMaterial(this.floorBodyMaterial, this.diceBodyMaterial, {
        friction: 0.01,
        restitution: 0.5,
      }),
    )
    world.addContactMaterial(
      new CANNON.ContactMaterial(this.barrierBodyMaterial, this.diceBodyMaterial, {
        friction: 0,
        restitution: 1.0,
      }),
    )
    world.addContactMaterial(
      new CANNON.ContactMaterial(this.diceBodyMaterial, this.diceBodyMaterial, {
        friction: 0,
        restitution: 0.5,
      }),
    )
  }

  /**
   *
   * @param {array} diceValues
   * @param {DiceObject} [diceValues.dice]
   * @param {number} [diceValues.value]
   *
   */
  prepareValues(diceValues) {
    if (this.throwRunning) {
      throw new Error('Cannot start another throw. Please wait, till the current throw is finished.')
    }

    for (let i = 0; i < diceValues.length; i++) {
      if (diceValues[i].value < 1 || diceValues[i].dice.values < diceValues[i].value) {
        throw new Error(
          'Cannot throw die to value ' +
            diceValues[i].value +
            ', because it has only ' +
            diceValues[i].dice.values +
            ' sides.',
        )
      }
    }

    this.throwRunning = true

    for (let i = 0; i < diceValues.length; i++) {
      diceValues[i].dice.simulationRunning = true
      diceValues[i].vectors = diceValues[i].dice.getCurrentVectors()
      diceValues[i].stableCount = 0
    }

    let check = () => {
      let allStable = true
      for (let i = 0; i < diceValues.length; i++) {
        if (diceValues[i].dice.isFinished()) {
          diceValues[i].stableCount++
        } else {
          diceValues[i].stableCount = 0
        }

        if (diceValues[i].stableCount < 50) {
          allStable = false
        }
      }

      if (allStable) {
        console.log('all stable')
        this.world.removeEventListener('postStep', check)

        for (let i = 0; i < diceValues.length; i++) {
          // diceValues[i].dice.shiftUpperValue(diceValues[i].value)
          diceValues[i].dice.setVectors(diceValues[i].vectors)
          diceValues[i].dice.simulationRunning = false
        }

        this.throwRunning = false
      } else {
        this.world.step(this.world.dt)
      }
    }

    this.world.addEventListener('postStep', check)
  }
}

class DiceObject {
  /**
   * @constructor
   * @param {object} options
   * @param {Number} [options.size = 100]
   * @param {Number} [options.fontColor = '#000000']
   * @param {Number} [options.backColor = '#ffffff']
   */
  constructor(options) {
    options = this.setDefaults(options, {
      size: 100,
      fontColor: '#000000',
      backColor: '#ffffff',
    })

    this.object = null
    this.size = options.size
    this.invertUpside = false

    this.materialOptions = {
      specular: 0x172022,
      color: 0xf0f0f0,
      shininess: 40,
      shading: THREE.FlatShading,
    }
    this.labelColor = options.fontColor
    this.diceColor = options.backColor
  }

  setDefaults(options, defaults) {
    options = options || {}

    for (let key in defaults) {
      if (!defaults.hasOwnProperty(key)) {
        continue
      }

      if (!(key in options)) {
        options[key] = defaults[key]
      }
    }

    return options
  }

  emulateThrow(callback) {
    let stableCount = 0

    let check = () => {
      if (this.isFinished()) {
        stableCount++

        if (stableCount === 50) {
          DiceManager.world.removeEventListener('postStep', check)
          callback(this.getUpsideValue())
        }
      } else {
        stableCount = 0
      }

      DiceManager.world.step(DiceManager.world.dt)
    }

    DiceManager.world.addEventListener('postStep', check)
  }

  isFinished() {
    let threshold = 1

    let angularVelocity = this.object.body.angularVelocity
    let velocity = this.object.body.velocity

    return (
      Math.abs(angularVelocity.x) < threshold &&
      Math.abs(angularVelocity.y) < threshold &&
      Math.abs(angularVelocity.z) < threshold &&
      Math.abs(velocity.x) < threshold &&
      Math.abs(velocity.y) < threshold &&
      Math.abs(velocity.z) < threshold
    )
  }

  getUpsideValue() {
    let vector = new THREE.Vector3(0, this.invertUpside ? -1 : 1)
    let closest_face
    let closest_angle = Math.PI * 2
    for (let i = 0; i < this.object.geometry.faces.length; ++i) {
      let face = this.object.geometry.faces[i]
      if (face.materialIndex === 0) {
        continue
      }

      let angle = face.normal.clone().applyQuaternion(this.object.body.quaternion).angleTo(vector)
      if (angle < closest_angle) {
        closest_angle = angle
        closest_face = face
      }
    }

    return 1 closest_face.materialIndex - 1
  }

  getCurrentVectors() {
    return {
      position: this.object.body.position.clone(),
      quaternion: this.object.body.quaternion.clone(),
      velocity: this.object.body.velocity.clone(),
      angularVelocity: this.object.body.angularVelocity.clone(),
    }
  }

  setVectors(vectors) {
    this.object.body.position = vectors.position
    this.object.body.quaternion = vectors.quaternion
    this.object.body.velocity = vectors.velocity
    this.object.body.angularVelocity = vectors.angularVelocity
  }

  shiftUpperValue(toValue) {
    let geometry = this.object.geometry.clone()

    let fromValue = this.getUpsideValue()

    for (let i = 0, l = 6; i < l; ++i) {
      let materialIndex = i
      if (materialIndex === 0) {
        continue
      }

      materialIndex += toValue - fromValue - 1
      while (materialIndex > this.values) {
        materialIndex -= this.values
      }
      while (materialIndex < 1) {
        materialIndex += this.values
      }

      geometry.faces[i].materialIndex = materialIndex + 1
    }

    this.object.geometry = geometry
  }

  getObject() {
    return this.object
  }

  create() {
    if (!DiceManager.world) {
      throw new Error('You must call DiceManager.setWorld(world) first.')
    }
    this.object = new THREE.Mesh(
      new THREE.BoxGeometry(this.size, this.size, this.size),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    )

    this.object.reveiceShadow = true
    this.object.castShadow = true
    this.object.diceObject = this
    this.object.body = new CANNON.Body({
      mass: this.mass,
      shape: new CANNON.Box(new CANNON.Vec3(this.size)),
      material: DiceManager.diceBodyMaterial,
    })
    this.object.body.linearDamping = 0.1
    this.object.body.angularDamping = 0.1
    DiceManager.world.add(this.object.body)

    return this.object
  }

  updateMeshFromBody() {
    if (!this.simulationRunning) {
      this.object.position.copy(this.object.body.position)
      this.object.quaternion.copy(this.object.body.quaternion)
    }
  }

  updateBodyFromMesh() {
    this.object.body.position.copy(this.object.position)
    this.object.body.quaternion.copy(this.object.quaternion)
  }
}

export class DiceD6 extends DiceObject {
  constructor(options) {
    super(options)

    this.tab = 0.1
    this.af = Math.PI / 4
    this.chamfer = 0.96
    this.vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ]
    this.faces = [
      [0, 3, 2, 1, 1],
      [1, 2, 6, 5, 2],
      [0, 1, 5, 4, 3],
      [3, 7, 6, 2, 4],
      [0, 4, 7, 3, 5],
      [4, 5, 6, 7, 6],
    ]
    this.scaleFactor = 0.9
    this.values = 6
    this.faceTexts = [
      ' ',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ]
    this.textMargin = 1.0
    this.mass = 300
    this.inertia = 13

    this.create()
  }
}

export class DiceOrlog extends DiceObject {
  constructor(options) {
    super(options)

    this.tab = 0.1
    this.af = Math.PI / 4
    this.chamfer = 0.96
    this.vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ]
    this.faces = [
      [0, 3, 2, 1, 1],
      [1, 2, 6, 5, 2],
      [0, 1, 5, 4, 3],
      [3, 7, 6, 2, 4],
      [0, 4, 7, 3, 5],
      [4, 5, 6, 7, 6],
    ]
    this.scaleFactor = 0.9
    this.values = 6
    this.faceTexts = [
      ' ',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ]
    this.textMargin = 1.0
    this.mass = 300
    this.inertia = 13

    this.create()
  }
}

export const DiceManager = new DiceManagerClass()
// export const DiceD6 = new DiceD6();

if (typeof define === 'function' && define.amd) {
  define(function () {
    return {
      DiceManager: DiceManager,
      DiceD6: DiceD6,
      DiceOrlog: DiceOrlog,
    }
  })
} else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    DiceManager: DiceManager,
    DiceD6: DiceD6,
    DiceOrlog: DiceOrlog,
  }
} else {
  window.Dice = {
    DiceManager: DiceManager,
    DiceD6: DiceD6,
    DiceOrlog: DiceOrlog,
  }
}
