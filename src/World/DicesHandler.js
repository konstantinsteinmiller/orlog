import Dice from '@/World/Models/Dice.js'
import EventEmitter from '@/Utils/EventEmitter.js'
import {
  HIGHLIGHT_POSITION_MAP,
  DICE_FACES_MAP,
  ROTATION_FACE_MAP,
  GAMES_PHASES,
  GAME_PLAYER_TYPES,
  GAME_PLAYER_ID,
  MAX_DICE_THROWS,
} from '@/Utils/constants'
import { isWithinRange } from '@/Utils/math'
import { gsap as g } from 'gsap'
import { MotionPathPlugin } from 'gsap/all'
import dice1Img from '/public/textures/dices/dice1.jpg'
import dice2Img from '/public/textures/dices/dice2.jpg'
import dice3Img from '/public/textures/dices/dice3.jpg'
import dice4Img from '/public/textures/dices/dice4.jpg'
import dice5Img from '/public/textures/dices/dice5.jpg'
import dice6Img from '/public/textures/dices/dice6.jpg'
import Experience from '@/Experience.js'
import { getStorage } from '@/Utils/storage.js'
import { isDicePlanarRotated } from '@/Utils/utils.js'
const images = [dice1Img, dice2Img, dice3Img, dice4Img, dice5Img, dice6Img]

g.registerPlugin(MotionPathPlugin)

export default class DicesHandler extends EventEmitter {
  constructor(playerId, isPlayer) {
    super()
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.physics = this.experience.physics
    this.debug = this.experience.debug
    this.input = this.experience.input
    this.sounds = this.experience.sounds
    this.camera = this.experience.camera.instance
    this.world = this.experience.world
    this.gui = null

    this.sessionPlayer = getStorage(GAME_PLAYER_ID, true)
    this.playerId = playerId
    this.isPlayer = isPlayer
    this.midZOffset = 5
    this.offsetDirection = isPlayer ? 1 : -1

    this.dicesList = []
    this.diceMeshes = []

    const MAX_THROWS =
      this.debug.isActive && this.debug.useDebugThrows
        ? +window.location.hash.split('throws=')[1].split('&')[0]
        : MAX_DICE_THROWS

    this.availableThrows = MAX_THROWS
    this.isThrowing = false
    this.didAllDicesStopMoving = false
    this.didStartThrowing = false
    this.isMovingDices = false
    this.didNotSelectAnyDices = false

    this.rayCaster = new THREE.Raycaster()
    this.currentIntersect = null
    this.previousIntersect = null

    this.isPlayerAtTurn = null
    this.actionAfterDiceRollTimeout = 0

    // Debug
    if (this.debug.isActive && !this.isPlayer) {
      this.debugFolder = this.debug.ui.addFolder('dices')
      this.debugFolder.add(this, 'createDices')
      this.debugFolder.add(this, 'availableThrows', 1, 10, 1)
      this.debugFolder.close()
    }

    this.isWaitingToFinishRound = false
    this.input.on('dblclick', () => {
      /* hide the controls overlay */
      this.actionAfterDiceRollTimeout = Date.now()
      this.world.gui.showControlsOverlay(false)

      const playerIdAtTurn = this.world.getPlayerAtTurn()?.playerId
      if (
        !playerIdAtTurn === this.sessionPlayer ||
        !this.didAllDicesStopMoving ||
        this.availableThrows === 0 ||
        this.currentIntersect !== null ||
        this.isMovingDices
      ) {
        return
      }

      if (
        this.dicesList.every((dice) => !dice.highlightMesh.isSelected) &&
        this.playerId === playerIdAtTurn &&
        playerIdAtTurn === this.sessionPlayer
      ) {
        this.finishMovingDicesToEnemy()
      } else if (
        this.dicesList.some((dice) => !!dice.highlightMesh.isSelected) &&
        this.playerId === playerIdAtTurn &&
        playerIdAtTurn === this.sessionPlayer
      ) {
        // this.debug.isActive && console.log('SOME DICES WERE SELECTED')
        this.didNotSelectAnyDices = false
        this.moveSelectedDicesToEnemy()
      }
    })
    this.input.on('click', () => this.toggleDiceSelection())
  }

  finishMovingDicesToEnemy() {
    // this.debug.isActive && console.log(this.playerId, 'didnt SELECT ANY DICES!!!')
    this.didNotSelectAnyDices = true

    !this.isWaitingToFinishRound &&
      (this.isWaitingToFinishRound = true) &&
      setTimeout(() => {
        if (this.availableThrows === 0) {
          this.dicesList.forEach((dice) => {
            const diceHighlightMesh = dice.group.getObjectByName('diceHighlight')
            if (!diceHighlightMesh.isSelected && !diceHighlightMesh.isPlaced) {
              diceHighlightMesh.isSelected = true
            }
          })
          this.moveSelectedDicesToEnemy()
        } else {
          this.trigger('finished-moving-dices-to-enemy')
        }
        this.isWaitingToFinishRound = false
      }, 1000)
  }

  destroy() {
    this.input.off('dblclick', () => this.moveSelectedDicesToEnemy())
    this.input.off('click', () => this.toggleDiceSelection())
  }

  rearrangePlacedDices() {
    this.world.diceArrangeManager.rearrangePlacedDices()
  }

  moveSelectedDicesToEnemy() {
    this.isMovingDices = true
    this.rearrangePlacedDices()

    const playerAtTurn = this.world.getPlayerAtTurn(false)
    const otherPlayer = this.world.getPlayerAtTurn(true)
    const sessionPlayerId = getStorage(GAME_PLAYER_ID, true)

    let firstDiceFinishedMoving = false
    otherPlayer.dicesHandler.dicesList.concat(this.dicesList).forEach((dice, index) => {
      const highlightMesh = dice.group.getObjectByName('diceHighlight')

      let ownerDirection =
        (dice.mesh.userData.playerId !== playerAtTurn.playerId &&
          dice.mesh.userData.playerId === sessionPlayerId) ||
        (dice.mesh.userData.playerId !== playerAtTurn.playerId &&
          dice.mesh.userData.playerId !== sessionPlayerId)
          ? -1
          : 1

      if (highlightMesh.isSelected && !highlightMesh.isPlaced) {
        if (dice.group.body) {
          this.physics.destroy(dice.group.body)
          this.hasDestroyedBodies = true
        }
        highlightMesh.isPlaced = true

        const diceGap = 0.8
        const maxXOffset = (this.world.maxPositionIndex * diceGap) / 2
        const offsetX = dice.positionIndex * diceGap - maxXOffset
        const upwardFace = dice.mesh.userData.upwardFace

        const fromRotation = new THREE.Vector3().copy(dice.group.rotation)
        const rotationProps = ROTATION_FACE_MAP[upwardFace]
        dice.group.rotation.set(0, 0, 0)
        dice.group.rotation.set(rotationProps.x, rotationProps.y, rotationProps.z)

        const toRotation = dice.group.rotation
        dice.isMovingToEnemy = true

        g.fromTo(
          dice.group.rotation,
          {
            x: fromRotation.x,
            y: fromRotation.y,
            z: fromRotation.z,
            duration: 0.2,
            ease: 'sine.out',
          },
          {
            x: toRotation.x,
            y: toRotation.y,
            z: toRotation.z,
            duration: 0.6,
            ease: 'sine.out',
            delay: index * 0.4 + 0.1,
          },
        )

        g.to(dice.group.position, {
          x: dice.group.position.x,
          y: 1.5,
          z: dice.group.position.z,
          duration: 0.4,
          delay: index * 0.4,
        }).then(() => {
          g.to(dice.group.position, {
            x: offsetX,
            y: 1.5,
            z: this.offsetDirection * ownerDirection * (this.midZOffset - 4),
            duration: 0.6,
          }).then(() => {
            g.to(dice.group.position, {
              x: offsetX,
              y: dice.scale,
              z: this.offsetDirection * ownerDirection * (this.midZOffset - 4),
              duration: 0.4,
            }).then(() => {
              dice.toggleDice(false, false)
              dice.isMovingToEnemy = false
            })
          })
        })
        !firstDiceFinishedMoving &&
          (firstDiceFinishedMoving = true) &&
          setTimeout(() => {
            firstDiceFinishedMoving = true
            this.isMovingDices = false
            this.trigger('finished-moving-dices-to-enemy')
          }, 4000)
      } else if (highlightMesh.isPlaced) {
        const diceGap = 0.8
        const maxXOffset = (this.world.maxPositionIndex * diceGap) / 2
        const offsetX = dice.positionIndex * diceGap - maxXOffset

        if (!isWithinRange(offsetX - dice.group.position.x, -0.1, 0.1) && !dice.isMovingToEnemy) {
          g.to(dice.group.position, {
            x: dice.group.position.x,
            y: 2.5,
            z: dice.group.position.z,
            duration: 1,
            delay: index * 0.3,
          }).then(() => {
            g.to(dice.group.position, {
              x: offsetX,
              y: 2.5,
              z: this.offsetDirection * ownerDirection + dice.group.position.z,
              duration: 0.6,
            }).then(() => {
              g.to(dice.group.position, {
                x: offsetX,
                y: dice.scale,
                z: this.offsetDirection * ownerDirection * -1 + dice.group.position.z,
                duration: 0.6,
              })
            })
          })
        }
      }

      dice.mesh.userData.isMoving = false
    })
  }

  resetThrow() {
    // this.moveSelectedDicesToEnemy() ? needed?

    /* go to next phase with this diceHandler if all dices are placed */
    if (this.dicesList.every((dice) => dice.highlightMesh?.isPlaced)) {
      this.availableThrows = 0
      this.world.faithReachedByPlayer[this.playerId] = true
      this.trigger(GAMES_PHASES.FAITH_CASTING)
      Object.keys(this.world.faithReachedByPlayer).length < 2 && this.trigger(GAMES_PHASES.DICE_ROLL)
    }

    /* for some weird reason ammo breaks when even one body is destroyed,
     * so we have to destroy each other dice and recreate them.
     * This might cause memory leaks!!!!!!!!!!! */
    const playerIdAtTurn = this.world.getPlayerAtTurn()?.playerId
    if (this.hasDestroyedBodies) {
      this.rebuildDiceBodies()
    } else if (this.didNotSelectAnyDices === true) {
      // this.debug.isActive && console.log('and none has been destroyed: ')
      this.rebuildDiceBodies()
    } else if (
      this.dicesList.every((dice) => !dice.highlightMesh?.isPlaced) &&
      playerIdAtTurn === this.sessionPlayer
    ) {
      // this.debug.isActive &&
      // console.log(
      //   this.playerId,
      //   playerIdAtTurn,
      //   'No dices are placed and none has been destroyed, so throw random dice',
      // )
      this.randomDiceThrow()
    }
  }

  rebuildDiceBodies() {
    let firstDiceRebuild = false

    this.dicesList.forEach((dice) => {
      const highlightMesh = dice.highlightMesh
      if (!highlightMesh?.isSelected && !highlightMesh?.isPlaced) {
        if (dice.group.body) {
          this.physics.destroy(dice.group.body)
        }
        dice.group.clear()
        this.scene.remove(dice.group)
        setTimeout(() => {
          dice.setMesh(
            new THREE.Vector3(
              dice.modelNumber * 2,
              -dice.modelNumber * 2 - 2,
              this.offsetDirection * (dice.modelNumber * 2 + 1),
            ),
          )
          dice.setBody()
          dice.setCollisionHandler()
          this.diceMeshes = this.dicesList.map((dice) => dice.group.children[0])
          this.setThrowVelocity(dice.group.body, dice)
          !firstDiceRebuild &&
            (firstDiceRebuild = true) &&
            setTimeout(() => {
              this.trigger('dices-rebuild')
            }, 100)
        }, 500)
      }
    })
  }

  rethrowDice(dice) {
    this.world.disableDiceCollisonSound = false
    dice.isPlayingCollisionSound = false
    this.sounds.playSound('diceShake')
    this.isThrowing = true
    setTimeout(() => {
      this.didStartThrowing = true
      const body = dice.group?.body

      if (body) {
        dice.group.body.setVelocity(0, 0, 0)
        body.setAngularVelocity(0, 0, 0)
        body.setCollisionFlags(2)
        dice.group.position.set(...dice.position)
        body.needUpdate = true
        body.once.update(() => {
          body.setCollisionFlags(0)
          this.setThrowVelocity(body, dice)
        })
      }
      setTimeout(() => {
        this.isThrowing = false
      }, 1400)
    })
  }

  randomDiceThrow() {
    if (this.dicesList.every((dice) => dice.highlightMesh?.isPlaced)) {
      this.trigger(GAMES_PHASES.FAITH_CASTING)
    }
    if (this.availableThrows <= 0 || this.isThrowing) {
      return
    }

    this.isThrowing = true

    this.world.disableDiceCollisonSound = false
    this.dicesList.forEach((die) => (die.isPlayingCollisionSound = false))
    this.sounds.playSound('diceShake')
    setTimeout(() => {
      /* pickup all not selected dices to rethrow them */
      this.didStartThrowing = true
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
      setTimeout(() => {
        this.didAllDicesStopMoving = false
      }, 500)
      setTimeout(() => {
        this.isThrowing = false
      }, 1200)
    }, 700)
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
    this.gui = this.world.gui
    const player = this.world.players[this.playerId]
    if (!player.isPlayerAtTurn) {
      return
    }

    this.diceGroup = new THREE.Group({ name: 'diceGroup' })
    this.diceGroup.name = 'diceGroup'
    this.dicesList = [
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        1,
        new THREE.Vector3(-0.5, 2, 1),
        new THREE.Vector3(0, 0, 1),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        2,
        new THREE.Vector3(0, 2, 1),
        new THREE.Vector3(0, 0, PI * 0.5),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        3,
        new THREE.Vector3(0.5, 2, 1),
        new THREE.Vector3(0, 0, PI),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        4,
        new THREE.Vector3(-0.5, 2, 1.6),
        new THREE.Vector3(0, 0, PI * 1.5),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        5,
        new THREE.Vector3(-0.3, 1.6, 1.75),
        new THREE.Vector3(PI * 0.5, 0, 0),
      ),
      new Dice(
        this.diceGroup,
        this.isPlayer,
        this.playerId,
        6,
        new THREE.Vector3(-0.2, 2.5, 2.3),
        new THREE.Vector3(PI * 0.3, PI * -0.9, PI * -0.6),
      ),
    ]
    this.diceMeshes = this.dicesList.map((dice) => dice.group.children[0])
    this.scene.add(this.diceGroup)
  }

  handleDiceHover() {
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(this.diceMeshes)

    if (intersections.length && !this.isThrowing) {
      this.currentIntersect = intersections[0].object
      this.dicesList.forEach((dice) => {
        dice.highlightMesh.isHighlighted =
          this.currentIntersect.name === dice?.mesh.name && !dice.highlightMesh?.isPlaced
      })
      this.evaluateTopFace()
      this.setDiceTopFaceHighlighter()

      if (
        this.isPlayer &&
        this.currentIntersect?.userData?.playerId === this.playerId &&
        this.world.isDiceRollPhase()
      ) {
        this.gui.toggleCursor(true)
      }
    } else {
      this.removeCurrentIntersect()
    }
  }

  removeCurrentIntersect() {
    if (this.currentIntersect) {
      if (this.previousIntersect?.name !== this.currentIntersect?.name) {
        // this.debug.isActive && console.log('NEW Intersect: ', this.currentIntersect)
      }
      if (this.currentIntersect.parent) {
        this.currentIntersect.parent.getObjectByName('diceHighlight').isHighlighted = false
      }
      this.gui.toggleCursor(false)
      diceFacesLayout.style.opacity = 0
    }
    this.previousIntersect = { name: this.currentIntersect?.name }
    this.currentIntersect = null
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
    this.dicesList.forEach((dice) => {
      const dI = dice.modelNumber
      const childMesh = dice.group.children[0]
      const childUp = dice.group.getObjectByName('upSideDetector')
      const childFront = dice.group.getObjectByName('frontSideDetector')
      const childRight = dice.group.getObjectByName('rightSideDetector')

      /* to get the current world position of the dice, we need to detach from the parent group */
      if (childUp?.parent && childFront?.parent && childRight?.parent) {
        this.scene.attach(childUp) // detach from parent and add to scene
        this.scene.attach(childFront)
        this.scene.attach(childRight)
        dice.group.attach(childUp) // reattach to original parent
        dice.group.attach(childFront)
        dice.group.attach(childRight)

        const worldPosUp = new THREE.Vector3().applyMatrix4(childUp.matrixWorld)
        const worldPosFront = new THREE.Vector3().applyMatrix4(childFront.matrixWorld)
        const worldPosRight = new THREE.Vector3().applyMatrix4(childRight.matrixWorld)

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
      }
    })
  }

  toggleDiceSelection() {
    this.actionAfterDiceRollTimeout = Date.now()
    this.world.gui.showControlsOverlay(false)

    const player = this.world.players[this.playerId]
    if (this.currentIntersect && !this.isThrowing) {
      // console.log('this.currentIntersect: ', this.currentIntersect.userData?.playerId, this.playerId)
      if (
        player.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC ||
        this.currentIntersect.userData?.playerId !== this.playerId
      ) {
        this.debug.isActive &&
          console.log(
            `${
              player.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC ? 'NPC' : ''
            } SHOULDN'T BE ABLE TO CALL THIS`,
          )
        return
      }
      if (
        (!player.isPlayerAtTurn && player.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER) ||
        this.isMovingDices
      ) {
        this.debug.isActive && console.log('not my turn')
        return
      }

      const diceHighlightMesh = this.currentIntersect?.parent?.getObjectByName('diceHighlight')
      if (!diceHighlightMesh?.isPlaced) {
        this.dicesList.some((dice) => dice.mesh.name === this.currentIntersect.name && dice.toggleDice(true))
      }
    }
  }

  detectIfDicesStoppedMoving() {
    if (
      this.debug.isPhysicsDebugActive &&
      !this.didAllDicesStopMoving &&
      !this.isThrowing &&
      this.didStartThrowing &&
      this.dicesList.every((dice) => dice.mesh.userData.isMoving === false && dice.group.position.y < 0.5)
    ) {
      // alert('all dices stopped moving')
      // console.log('ALL Dices stopped moving!!!!!!!!!!!!!')
      this.didAllDicesStopMoving = true
      this.didStartThrowing = false
      this.world.disableDiceCollisonSound = true
      this.dicesList.forEach((die) => (die.isPlayingCollisionSound = false))
      this.trigger('dices-stopped')
      setTimeout(() => {
        this.evaluateTopFace()
        this.availableThrows--
        this.trigger('faces-evaluated')

        if (this.availableThrows === 0) {
          this.gui.showControlsOverlay(false)
          this.dicesList.forEach((dice) => {
            const diceHighlightMesh = dice.group.getObjectByName('diceHighlight')
            if (!diceHighlightMesh.isSelected && !diceHighlightMesh.isPlaced) {
              diceHighlightMesh.isSelected = true
            }
          })
          this.moveSelectedDicesToEnemy()
        }
      }, 700)

      this.gui.showControlsOverlayDelayed(this.actionAfterDiceRollTimeout)

      return true
    }
    return false
  }

  removeStolenDices() {
    this.dicesList = this.dicesList.filter((die) => die.owner.playerId === this.playerId)
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
          const playerZOffset = this.offsetDirection * this.midZOffset
          const outOfBowl = !(
            isWithinRange(dice.group.position.x, -2.5, 2.5) &&
            isWithinRange(dice.group.position.z, playerZOffset - 2.5, playerZOffset + 2.5)
          )
          if (
            (dice.group.position.y > 0.5 || !isDicePlanarRotated(dice) || outOfBowl) &&
            this.didStartThrowing
          ) {
            this.rethrowDice(dice) // don't wait for the dice to fall, just rethrow it
          } else {
            dice.mesh.userData.isMoving = !didDiceStoppedMoving
          }
        }
        return didDiceStoppedMoving
      })

    this.detectIfDicesStoppedMoving()

    /* enable hovering over dices as all faces are evaluated */
    if (this.world.isDiceRollPhase()) {
      this.dicesList.every((dice) => dice.mesh?.userData?.upwardFace !== undefined) && this.handleDiceHover()
    } else if (this.currentIntersect) {
      this.removeCurrentIntersect()
    }
  }

  reset() {
    this.dicesList = []
    this.diceMeshes = []
    this.availableThrows = MAX_DICE_THROWS
    this.isThrowing = false
    this.didAllDicesStopMoving = false
    this.didStartThrowing = false
    this.isMovingDices = false

    this.currentIntersect = null
    this.previousIntersect = null
  }
}
