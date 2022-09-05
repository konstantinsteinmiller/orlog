import Dice from '@/World/Models/Dice.js'
import { HIGHLIGHT_POSITION_MAP, DICE_FACES_MAP } from '@/Utils/constants'
import { isWithinRange } from '@/Utils/math'
import { gsap as g } from 'gsap'

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

  moveSelectedDicesToEnemy() {
    this.dicesList.forEach((dice) => {
      const highlightMesh = dice.group.getObjectByName('diceHighlight')

      if (highlightMesh.isSelected && !highlightMesh.isPlaced) {
        this.physics.destroy(dice.group.body)
        highlightMesh.isPlaced = true
        this.hasDestroyedBodies = true
        const offsetX = dice.modelNumber * 1.4 - 4.2
        const offsetHalfX = offsetX / 2
        g.to(dice.group.position, {
          y: 2.5,
          x: offsetHalfX,
          z: -3,
          duration: 2,
          ease: 'sine.out',
          delay: 0,
        })
        setTimeout(() => {
          g.to(dice.group.position, {
            x: offsetX,
            y: dice.scale,
            z: -5,
            duration: 2,
            delay: 0,
            ease: 'sine.out',
          })
        }, 2000)
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
            dice.group.body.setVelocity(0.3, -0.2, -1.2)
            dice.group.body.setAngularVelocity(-7, -7, 6)
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

    if (intersections.length && !this.isThrowing) {
      this.currentIntersect = intersections[0].object
      this.dicesList.forEach((dice) => {
        dice.group.getObjectByName('diceHighlight').isHighlighted =
          this.currentIntersect.name === dice.mesh.name
      })
      this.setDiceTopFaceHighlighter()
    } else {
      if (this.currentIntersect) {
        if (this.previousIntersect?.name !== this.currentIntersect?.name) {
          this.debug.isActive && console.log('NEW Intersect: ', this.currentIntersect)
        }
        if (this.currentIntersect.parent) {
          this.currentIntersect.parent.getObjectByName('diceHighlight').isHighlighted = false
        }
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

      this.setUpwardFace = (face, axis) => {
        childMesh.userData.upwardFace = face
        childMesh.userData.upwardSymbol = DICE_FACES_MAP[dI]?.[face].symbol
        childMesh.userData.isGoldenSymbol = DICE_FACES_MAP[dI]?.[face].isGolden
        /*this.debug?.isActive &&
          console.error(
            `${axis} ${face[0].toUpperCase()}${face.substring(1)} // ${DICE_FACES_MAP[dI]?.[face].symbol} ${
              DICE_FACES_MAP[dI]?.[face].isGolden ? 'Golden' : ''
            }`,
          )*/
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
      console.log('ALL Dices stopped moving!!!!!!!!!!!!!')
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

    this.dicesList.every((dice, index) => dice.mesh?.userData?.upwardFace !== undefined) &&
      this.handleDiceHover()
  }
}
