import Dice from '@/World/Models/Dice.js'
import { HIGHLIGHT_POSITION_MAP, DICE_FACES_MAP } from '@/Utils/constants'
import { isWithinRange } from '@/Utils/math'

export default class DicesHandler {
  constructor() {
    this.scene = experience.scene
    this.physics = experience.physics
    this.debug = experience.debug
    this.input = experience.input
    this.sounds = experience.sounds
    this.camera = experience.camera.instance
    this.dicesList = []
    this.diceMeshes = []
    this.availableThrows = 3
    this.isThrowing = false
    this.didAllDicesStopMoving = false
    this.disableDiceCollisonSound = false

    this.rayCaster = new THREE.Raycaster()
    this.currentIntersect = null
    this.previousIntersect = null

    // init code
    this.createDices()

    // Debug
    if (this.debug.isActive) {
      this.debugFolder = this.debug.ui.addFolder('dices')
      this.debugFolder.add(this, 'createDices')
      this.debugFolder.add(this, 'availableThrows', 1, 10, 1)
    }

    window.onkeydown = (e) => {
      e.code === 'Space' && this.evaluateTopFace()
    }
    window.ondblclick = () => this.randomDiceThrow()
    window.onclick = this.toggleDiceSelection

    // webgl.onclick = (dices) => this.randomDiceThrow(dices)
  }
  destructor() {
    window.removeEventListener('dblclick', this.evaluateTopFace)
    window.removeEventListener('click', this.toggleDiceSelection)
    window.removeEventListener('keydown', (e) => {
      e.code === 'Space' && this.evaluateTopFace()
    })
  }

  randomDiceThrow(rethrowDicesList = []) {
    if ((this.availableThrows <= 0 && !rethrowDicesList.length) || this.isThrowing) {
      return
    }

    this.isPlayingCollisionSound = false
    this.disableDiceCollisonSound = false
    this.isThrowing = true
    this.sounds.playDiceShakeSound()
    // rethrowDicesList einbauen
    setTimeout(() => {
      this.dicesList.forEach((dice) => {
        if (!dice?.group.getObjectByName('diceHighlight')?.isSelected) {
          const body = dice.group?.body

          // set the new position
          if (body) {
            body.setVelocity(0, 0, 0)
            body.setAngularVelocity(0, 0, 0)
            body.setCollisionFlags(2)

            dice.group.position.set(...dice.position)
            body.needUpdate = true

            // this will run only on the next update if body.needUpdate = true
            body.once.update(() => {
              // set body back to dynamic
              body.setCollisionFlags(0)

              // if you do not reset the velocity and angularVelocity, the object will keep it
              body.setVelocity(0.3, -0.2, -1.2)
              body.setAngularVelocity(-7, -7, 6)
            })
          } else {
            body.setVelocity(0.3, -0.2, -1.2)
            body.setAngularVelocity(-7, -7, 6)
          }
        }
      })
      /*!this.debug.isActive &&*/ this.availableThrows--
      setTimeout(() => {
        this.isThrowing = false
        this.didAllDicesStopMoving = false
      }, 500)
    }, 500)
  }
  createDices() {
    this.diceGroup = new THREE.Group({ name: 'diceGroup' })
    this.diceGroup.name = 'diceGroup'
    this.dicesList = [
      new Dice(this.diceGroup, 1, new THREE.Vector3(-0.5, 3, 1), new THREE.Vector3(0, 0, 1)),
      new Dice(this.diceGroup, 2, new THREE.Vector3(0, 3, 1), new THREE.Vector3(0, 0, PI * 0.5)),
      new Dice(this.diceGroup, 3, new THREE.Vector3(0.5, 3, 1), new THREE.Vector3(0, 0, PI)),
      new Dice(this.diceGroup, 4, new THREE.Vector3(-0.5, 3, 1.6), new THREE.Vector3(0, 0, PI * 1.5)),
      new Dice(this.diceGroup, 5, new THREE.Vector3(0, 3, 1.6), new THREE.Vector3(PI * 0.5, 0, 0)),
      new Dice(this.diceGroup, 6, new THREE.Vector3(0.5, 3, 1.6), new THREE.Vector3(PI * 0.5, PI, PI * 1.5)),
    ]
    this.diceMeshes = this.dicesList.map((dice) => dice.group.children[0])
    this.scene.add(this.diceGroup)
    this.randomDiceThrow()
  }
  handleDiceHover() {
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(this.diceMeshes)

    if (intersections.length) {
      this.currentIntersect = intersections[0].object
      this.dicesList.forEach((dice) => {
        dice.group.getObjectByName('diceHighlight').isHighlighted = this.currentIntersect.name === dice.name
      })
      this.setDiceTopFaceHighlighter()
    } else {
      if (this.currentIntersect) {
        if (this.previousIntersect?.name !== this.currentIntersect?.name) {
          console.log('NEW Intersect: ', this.currentIntersect)
        }
        this.currentIntersect.parent.getObjectByName('diceHighlight').isHighlighted = false
      }
      this.previousIntersect = { name: this.currentIntersect?.name }
      this.currentIntersect = null
      diceFacesLayout.style.opacity = 0
    }
  }

  setDiceTopFaceHighlighter() {
    if (this.currentIntersect.name.substring(0, 4) === 'Dice') {
      const diceModelNumber = this.currentIntersect.name.substring(4, 5)
      diceFacesLayout.style.opacity = 0.8
      const upwardFace = this.currentIntersect?.userData?.upwardFace
      if (upwardFace) {
        faceHighlight.style.top = HIGHLIGHT_POSITION_MAP?.[upwardFace].top
        faceHighlight.style.right = HIGHLIGHT_POSITION_MAP?.[upwardFace].right
      }
      diceFaces.src = `./public/textures/dices/dice${diceModelNumber}.jpg`
    } else {
      console.error('wrong intersection')
    }
  }

  evaluateTopFace = () => {
    this.dicesList.forEach((dice, index) => {
      const dI = index + 1
      const childMesh = dice.group.children[0]
      const childUp = dice.group.getObjectByName('upSideDetector')
      const childFront = dice.group.getObjectByName('frontSideDetector')
      const childRight = dice.group.getObjectByName('rightSideDetector')

      /* to get the current world position of the dice, we need to detach from the parent group */
      this.scene.attach(childUp) // detach from parent and add to scene
      this.scene.attach(childFront)
      this.scene.attach(childRight)
      dice.group.attach(childUp) // reattach to original parent
      dice.group.attach(childFront)
      dice.group.attach(childRight)

      var worldPosUp = new THREE.Vector3().applyMatrix4(childUp.matrixWorld)
      var worldPosFront = new THREE.Vector3().applyMatrix4(childFront.matrixWorld)
      var worldPosRight = new THREE.Vector3().applyMatrix4(childRight.matrixWorld)

      const Uy = worldPosUp.y.toFixed(2)
      const Fy = worldPosFront.y.toFixed(2)
      const Ry = worldPosRight.y.toFixed(2)
      // console.log('Uy, Fy, Ry: ', Uy, Fy, Ry)

      this.setUpwardFace = (face, axis) => {
        childMesh.userData.upwardFace = face
        childMesh.userData.upwardSymbol = DICE_FACES_MAP[dI]?.[face].symbol
        childMesh.userData.isGoldenSymbol = DICE_FACES_MAP[dI]?.[face].isGolden
        this.debug?.isActive &&
          console.error(
            `${axis} ${face[0].toUpperCase()}${face.substring(1)} // ${DICE_FACES_MAP[dI]?.[face].symbol} ${
              DICE_FACES_MAP[dI]?.[face].isGolden ? 'Golden' : ''
            }`,
          )
      }

      if (Uy > Fy && Uy > Ry) {
        this.setUpwardFace('top', 'Y')
      }
      if (Uy < Fy && Uy < Ry) {
        this.setUpwardFace('bottom', '-Y')
      }
      if (Fy > Uy && Fy > Ry) {
        this.setUpwardFace('front', 'Z')
      }
      if (Fy < Uy && Fy < Ry) {
        this.setUpwardFace('back', '-Z')
      }
      if (Ry > Uy && Ry > Fy) {
        this.setUpwardFace('right', 'X')
      }
      if (Ry < Uy && Ry < Fy) {
        this.setUpwardFace('left', '-X')
      }
    })
  }

  toggleDiceSelection = () => {
    if (this.currentIntersect) {
      const diceHighlightMesh = this.currentIntersect.parent.getObjectByName('diceHighlight')
      diceHighlightMesh.isSelected = !diceHighlightMesh.isSelected
      diceHighlightMesh.isHighlighted = true
    }
  }

  update() {
    this.dicesList.forEach((dice) => {
      const diceHighlightMesh = dice.group.getObjectByName('diceHighlight')

      if (diceHighlightMesh.isHighlighted && !diceHighlightMesh.isSelected) {
        diceHighlightMesh.material.color.set(0xffff00)
        diceHighlightMesh.material.opacity = 0.2
      } else if (diceHighlightMesh.isSelected) {
        diceHighlightMesh.material.color.set(0x00ff00)
        diceHighlightMesh.material.opacity = 0.3
      } else {
        diceHighlightMesh.material.opacity = 0
      }

      if (this.debug.isPhysicsDebugActive) {
      }
    })

    /* checks if dices stopped moving and write into dice data */
    this.debug.isPhysicsDebugActive &&
      this.dicesList.forEach((dice) => {
        const body = dice.group.body
        // const mainMesh = dice.mesh
        const angularVelocity = new THREE.Vector3(1, 1, 1).dot(
          new THREE.Vector3(
            Math.abs(body.angularVelocity.x),
            Math.abs(body.angularVelocity.y),
            Math.abs(body.angularVelocity.z),
          ),
        )
        const velocity = new THREE.Vector3(1, 1, 1).dot(
          new THREE.Vector3(Math.abs(body.velocity.x), Math.abs(body.velocity.y), Math.abs(body.velocity.z)),
        )

        const didDiceStoppedMoving =
          isWithinRange(angularVelocity, -0.1, 0.1) && isWithinRange(velocity, -0.1, 0.1) && velocity !== 0
        if (didDiceStoppedMoving) {
          dice.mesh.userData.isMoving = !didDiceStoppedMoving
        }
        return didDiceStoppedMoving
      })

    if (
      this.debug.isPhysicsDebugActive &&
      !this.didAllDicesStopMoving &&
      !this.isThrowing &&
      this.dicesList.every((dice) => dice.mesh.userData.isMoving === false)
    ) {
      // alert('all dices stopped moving')
      console.log('ALL Dices stopped moving!!!!!!!!!!!!!')
      this.didAllDicesStopMoving = true
      this.disableDiceCollisonSound = true
      this.evaluateTopFace()
    }

    this.dicesList.every((dice, index) => {
      const childMesh = dice.group.children[0]
      // dice?.userData?.upwardFace &&
      //   console.log(
      //     `${index}dice:
      //    ${dice?.userData?.upwardFace}
      //    ${dice?.userData?.upwardSymbol}
      //    ${dice?.userData?.isGoldenSymbol ? 'Golden' : ''}`,
      //   )
      return childMesh?.userData?.upwardFace !== undefined
    }) && this.handleDiceHover()
  }
}
