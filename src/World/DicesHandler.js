import Dice from '@/World/Models/Dice.js'
import {
  HIGHLIGHT_POSITION_MAP,
  DICE_FACES_MAP,
  ROTATION_FACE_MAP,
  GAME_PLAYER_TYPES,
} from '@/Utils/constants'
import { isWithinRange } from '@/Utils/math'
import { gsap as g } from 'gsap'
import dice1Img from '/public/textures/dices/dice1.jpg'
import dice2Img from '/public/textures/dices/dice2.jpg'
import dice3Img from '/public/textures/dices/dice3.jpg'
import dice4Img from '/public/textures/dices/dice4.jpg'
import dice5Img from '/public/textures/dices/dice5.jpg'
import dice6Img from '/public/textures/dices/dice6.jpg'
const images = [dice1Img, dice2Img, dice3Img, dice4Img, dice5Img, dice6Img]

export default class DicesHandler {
  constructor(playerId, isPlayer) {
    this.experience = experience
    this.scene = experience.scene
    this.physics = experience.physics
    this.debug = experience.debug
    this.input = experience.input
    this.sounds = experience.sounds
    this.camera = experience.camera.instance

    this.playerId = playerId
    this.isPlayer = isPlayer
    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.dicesList = []
    this.diceMeshes = []
    this.availableThrows = 3
    this.isThrowing = false
    this.didAllDicesStopMoving = false
    this.disableDiceCollisonSound = false

    this.rayCaster = new THREE.Raycaster()
    this.currentIntersect = null
    this.previousIntersect = null

    this.isPlayerAtTurn = null /*this.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER && isPlayer*/

    // init code
    // this.createDices()
    //
    // Debug
    if (this.debug.isActive && !this.isPlayer) {
      this.debugFolder = this.debug.ui.addFolder('dices')
      this.debugFolder.add(this, 'createDices')
      this.debugFolder.add(this, 'availableThrows', 1, 10, 1)
    }

    this.input.on('dblclick', () => this.randomDiceThrow())
    this.input.on('click', () => this.toggleDiceSelection())
  }

  destroy() {
    this.input.off('dblclick', () => this.randomDiceThrow())
    this.input.off('click', () => this.toggleDiceSelection())
  }

  moveSelectedDicesToEnemy() {
    this.dicesList.forEach((dice) => {
      const highlightMesh = dice.group.getObjectByName('diceHighlight')

      if (highlightMesh.isSelected && !highlightMesh.isPlaced) {
        this.physics.destroy(dice.group.body)
        highlightMesh.isPlaced = true
        this.hasDestroyedBodies = true
        const offsetX = dice.modelNumber * 1.4 - 4.9
        const offsetHalfX = offsetX / 2
        const upwardFace = dice.mesh.userData.upwardFace

        const fromRotation = new THREE.Vector3().copy(dice.group.rotation)
        const rotationProps = ROTATION_FACE_MAP[upwardFace]
        dice.group.rotation.set(0, 0, 0)
        dice.group.rotation.set(rotationProps.x, rotationProps.y, rotationProps.z)

        const toRotation = dice.group.rotation

        g.fromTo(
          dice.group.rotation,
          {
            x: fromRotation.x,
            y: fromRotation.y,
            z: fromRotation.z,
            duration: 2,
            ease: 'sine.out',
            delay: 0,
          },
          {
            x: toRotation.x,
            y: toRotation.y,
            z: toRotation.z,
            duration: 2,
            ease: 'sine.out',
            delay: 0,
          },
        )
        g.to(dice.group.position, {
          x: offsetHalfX,
          y: 2.5,
          z: this.offsetDirection * (this.midZOffset - 1.8),
          duration: 2,
          ease: 'sine.out',
          delay: 0,
        }).then(() => {
          g.to(dice.group.position, {
            x: offsetX,
            y: dice.scale,
            z: this.offsetDirection * (this.midZOffset - 4),
            duration: 2,
            delay: 0,
            ease: 'sine.out',
          }).then(() => {
            // dice.toggleHighlight()
            highlightMesh.isSelected = !highlightMesh.isSelected
            highlightMesh.isHighlighted = false
          })
        })
      }
      dice.mesh.userData.isMoving = false
    })
  }

  resetThrow() {
    this.moveSelectedDicesToEnemy()

    /* for some weird reason ammo breaks when even one body is destroyed,
     * so we have to destroy each other dice and recreate them.
     * This might cause memory leaks!!!!!!!!!!! */
    this.hasDestroyedBodies &&
      this.dicesList.forEach((dice) => {
        const highlightMesh = dice.group.getObjectByName('diceHighlight')
        if (!highlightMesh.isSelected) {
          this.physics.destroy(dice.group.body)
          dice.group.clear()
          this.scene.remove(dice.group)
          setTimeout(() => {
            dice.setMesh()
            dice.setBody()
            dice.setCollisionHandler()
            this.diceMeshes = this.dicesList.map((dice) => dice.group.children[0])
            // dice.group.body.setVelocity(Math.PI * 0.3 - 0.6, Math.PI * -0.2 - 0.3, Math.PI * -0.9 + 0.4)
            // dice.group.body.setAngularVelocity(Math.PI * -4 + 4, Math.PI * -4 + 2, Math.PI * 3 - 2)

            this.setThrowVelocity(dice.group.body, dice)
          }, 500)
        }
      })
  }

  randomDiceThrow() {
    if (this.availableThrows <= 0 || this.isThrowing) {
      return
    }

    this.resetThrow()
    this.isThrowing = true
    this.disableDiceCollisonSound = false
    this.sounds.playDiceShakeSound()
    setTimeout(() => {
      /* pickup all not selected dices to rethrow them */
      this.dicesList.forEach((dice) => {
        const diceHighlight = dice?.group.getObjectByName('diceHighlight')
        if (!diceHighlight?.isSelected && !diceHighlight?.isPlaced) {
          const body = dice.group?.body

          // set the new position // TELEPORT dynamic ammo body
          if (body) {
            body.setVelocity(0, 0, 0)
            body.setAngularVelocity(0, 0, 0)
            /* only kinematic bodies can be repositioned 2=kinematic 0=dynamic*/
            body.setCollisionFlags(2)

            dice.group.position.set(...dice.position)
            body.needUpdate = true

            // this will run only on the next update if body.needUpdate = true
            body.once.update(() => {
              // set body back to dynamic
              body.setCollisionFlags(0)

              this.setThrowVelocity(body, dice)
            })
          }
        }
      })
      this.availableThrows--
      setTimeout(() => {
        this.didAllDicesStopMoving = false
      }, 500)
      setTimeout(() => {
        this.isThrowing = false
      }, 1200)
    }, 400)
  }

  setThrowVelocity(body, dice) {
    const modelNumber = dice.modelNumber
    const baseVelocityX = modelNumber === 6 ? Math.PI * 0.25 + 0.425 : Math.PI * 0.25 - 0.5
    const baseVelocityZ = modelNumber === 6 ? Math.PI * -0.6 + 0.1 : Math.PI * -0.8 + 0.4
    const baseAngularX = modelNumber === 6 ? Math.PI * -4 + 3.5 : Math.PI * -4 + 2
    const baseAngularY = modelNumber === 6 ? Math.PI * -3 + 6.5 : Math.PI * -4 + 2
    const baseAngularZ = modelNumber === 6 ? Math.PI * 3 - 5 : Math.PI * 3 - 2
    const velocityX = baseVelocityX * this.offsetDirection
    const velocityY = (Math.PI * -0.2 - 0.6) * this.offsetDirection
    const velocityZ = baseVelocityZ * this.offsetDirection
    const angularX = baseAngularX * this.offsetDirection
    const angularY = baseAngularY * this.offsetDirection
    const angularZ = baseAngularZ * this.offsetDirection
    body.setVelocity(velocityX, velocityY, velocityZ)
    body.setAngularVelocity(angularX, angularY, angularZ)
  }

  createDices() {
    const player = this.experience.world.players[this.playerId]
    if (!player.isPlayerAtTurn) {
      return
    }

    this.diceGroup = new THREE.Group({ name: 'diceGroup' })
    this.diceGroup.name = 'diceGroup'
    this.dicesList = [
      new Dice(this.diceGroup, this.isPlayer, 1, new THREE.Vector3(-0.5, 2, 1), new THREE.Vector3(0, 0, 1)),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        2,
        new THREE.Vector3(0, 2, 1),
        new THREE.Vector3(0, 0, PI * 0.5),
      ),
      new Dice(this.diceGroup, this.isPlayer, 3, new THREE.Vector3(0.5, 2, 1), new THREE.Vector3(0, 0, PI)),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        4,
        new THREE.Vector3(-0.5, 2, 1.6),
        new THREE.Vector3(0, 0, PI * 1.5),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        5,
        new THREE.Vector3(-0.3, 1.6, 1.75),
        new THREE.Vector3(PI * 0.5, 0, 0),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        6,
        new THREE.Vector3(-0.2, 2.5, 2.3),
        new THREE.Vector3(PI * 0.3, PI * -0.9, PI * -0.6),
      ),
    ]
    this.diceMeshes = this.dicesList.map((dice) => dice.group.children[0])
    this.scene.add(this.diceGroup)
    this.randomDiceThrow()
  }

  handleDiceHover() {
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(this.diceMeshes)

    if (intersections.length && !this.isThrowing) {
      this.currentIntersect = intersections[0].object
      this.dicesList.forEach((dice) => {
        dice.group.getObjectByName('diceHighlight').isHighlighted =
          this.currentIntersect.name === dice.mesh.name && !dice.highlightMesh.isPlaced
      })
      this.evaluateTopFace()
      this.setDiceTopFaceHighlighter()
    } else {
      if (this.currentIntersect) {
        if (this.previousIntersect?.name !== this.currentIntersect?.name) {
          this.debug.isActive && console.log('NEW Intersect: ', this.currentIntersect)
        }
        if (this.currentIntersect.parent) {
          this.currentIntersect.parent.getObjectByName('diceHighlight').isHighlighted = false
        }
        diceFacesLayout.style.opacity = 0
      }
      this.previousIntersect = { name: this.currentIntersect?.name }
      this.currentIntersect = null
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
      diceFaces.src = images[diceModelNumber - 1]
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

      this.setUpwardFace = (face, axis) => {
        childMesh.userData.upwardFace = face
        childMesh.userData.upwardSymbol = DICE_FACES_MAP[dI]?.[face].symbol
        childMesh.userData.isGoldenSymbol = DICE_FACES_MAP[dI]?.[face].isGolden
        // this.debug?.isActive &&
        // console.error(
        //   `${axis} ${face[0].toUpperCase()}${face.substring(1)} // ${DICE_FACES_MAP[dI]?.[face].symbol} ${
        //     DICE_FACES_MAP[dI]?.[face].isGolden ? 'Golden' : ''
        //   }`,
        // )
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

  toggleDiceSelection() {
    if (this.currentIntersect && !this.isThrowing) {
      const diceHighlightMesh = this.currentIntersect.parent.getObjectByName('diceHighlight')
      if (!diceHighlightMesh?.isPlaced) {
        diceHighlightMesh.isSelected = !diceHighlightMesh.isSelected
        diceHighlightMesh.isHighlighted = true
      }
    }
  }

  update() {
    this.dicesList.forEach((dice) => {
      const diceHighlightMesh = dice.group.getObjectByName('diceHighlight')

      if (!diceHighlightMesh) {
        return
      }
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
        if (!body) {
          return
        }
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
      // console.log('ALL Dices stopped moving!!!!!!!!!!!!!')
      this.didAllDicesStopMoving = true
      this.disableDiceCollisonSound = true
      setTimeout(() => {
        this.evaluateTopFace()
        if (this.availableThrows === 0) {
          this.dicesList.forEach((dice) => {
            const diceHighlightMesh = dice.group.getObjectByName('diceHighlight')
            if (!diceHighlightMesh.isSelected && !diceHighlightMesh.isPlaced) {
              diceHighlightMesh.isSelected = true
            }
          })
          this.moveSelectedDicesToEnemy()
        }
      }, 700)
    }

    this.dicesList.every((dice) => dice.mesh?.userData?.upwardFace !== undefined) && this.handleDiceHover()
  }
}
