import * as gui from 'lil-gui'
import Stats from 'stats.js'
import { disposeMeshAndRemoveFromScene } from '@/Utils/ThreeHelpers.js'
import Experience from '@/Experience.js'
import { isDicePlanarRotated } from '@/Utils/utils.js'

export default class Debug {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.input = this.experience.input
    this.world = this.experience.world
    this.resources = this.experience.resources
    this.isActive = window.location.hash.includes('#debug')
    this.useDebugLifes = window.location.hash.includes('lifes=')
    this.useDebugFaithTokens = window.location.hash.includes('tokens=')
    this.useDebugNpcRune = window.location.hash.includes('rune=')
    this.isPhysicsDebugActive = true
    this.rayCaster = new THREE.Raycaster()

    this.debugCubeOptions = {
      hasCreatedDebugCube: false,
      referenceMesh: null,
      debugCube: null,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Vector3(0, 0, 0),
      scale: new THREE.Vector3(1.0, 1.0, 1.0),
    }

    if (this.isActive) {
      // STATS
      this.stats = new Stats()
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
      this.stats.begin()

      this.ui = new gui.GUI()
      this.debugFolter = this.ui.addFolder('physics')
      this.debugFolter.add(this, 'togglePhysicsDebug').name('Toggle physics debug')
      this.ui.close()

      setTimeout(() => {
        this.input = this.experience.input
        this.resources = this.experience.resources
        this.scene = this.experience.scene

        this.input.on('keydown', (event) => this.onKeyDown(event))
      }, 100)
    }
  }

  onKeyDown(event) {
    if (event.key === 'h') {
      this.ui._hidden ? this.ui.show() : this.ui.hide()
    } else if (event.key === 'c') {
      this.ui._closed ? this.ui.open() : this.ui.close()
    } else if (event.key === 'j') {
      if (this.debugCubeOptions.referenceMesh) {
        this.destroyDebugCube()
        return
      }

      this.rayCaster.setFromCamera(
        new THREE.Vector2(this.input.x, this.input.y),
        this.experience.camera.instance,
      )

      const intersections = this.rayCaster.intersectObjects(
        experience.scene.children.filter((child) => child.isMesh || child.isGroup),
      )

      if (intersections.length) {
        if (intersections[0].object?.parent?.isGroup) {
          this.debugCubeOptions.referenceMesh = intersections[0].object?.parent
          this.debugCubeOptions.position = new THREE.Vector3(
            intersections[0].point.x,
            intersections[0].point.y,
            intersections[0].point.z,
          )
        } else {
          this.debugCubeOptions.referenceMesh = intersections[0].object
        }
        this.createDebugCube()
      }
    } else if (event.code === 'KeyP') {
      if (this.debugCubeOptions.debugCube) {
        console.log(
          'debugCube.position xyz: ',
          this.debugCubeOptions.debugCube.position.x,
          this.debugCubeOptions.debugCube.position.y,
          this.debugCubeOptions.debugCube.position.z,
          this.debugCubeOptions.debugCube,
        )
      } else {
        this.experience.world.players['NPC'].dicesHandler.dicesList.forEach((dice) => {
          this.isActive &&
            console.log(
              ': ',
              isDicePlanarRotated(dice),
              (dice.group.rotation.x % Math.PI).toFixed(3),
              (dice.group.rotation.y % Math.PI).toFixed(3),
              (dice.group.rotation.z % Math.PI).toFixed(3),
            )
        })
      }
    } else if (event.code === 'KeyT') {
      this.world = this.experience.world
      if (this.world.players) {
        console.log('Turn: ', this.world.getPlayerAtTurn()?.playerId, 'in', this.world.currentGamePhase)
      }
    }
  }

  createDebugCube() {
    var materialArray = []
    const cubeMaterials = [
      new THREE.MeshBasicMaterial({ map: this.resources.items.xposDebugCube }),
      new THREE.MeshBasicMaterial({ map: this.resources.items.xnegDebugCube }),
      new THREE.MeshBasicMaterial({ map: this.resources.items.yposDebugCube }),
      new THREE.MeshBasicMaterial({ map: this.resources.items.ynegDebugCube }),
      new THREE.MeshBasicMaterial({ map: this.resources.items.zposDebugCube }),
      new THREE.MeshBasicMaterial({ map: this.resources.items.znegDebugCube }),
    ]

    const MovingCubeGeom = new THREE.BoxGeometry(2, 2, 2, 1, 1, 1, materialArray)
    this.debugCubeOptions.debugCube = new THREE.Mesh(MovingCubeGeom, cubeMaterials)

    this.debugCubeOptions.debugCube.position.copy(this.debugCubeOptions.position)
    this.debugCubeOptions.debugCube.rotation.copy(new THREE.Vector3(0, 0, 0))
    this.debugCubeOptions.debugCube.scale.copy(new THREE.Vector3(1, 1, 1))

    this.scene.add(this.debugCubeOptions.debugCube)
  }

  destroyDebugCube() {
    disposeMeshAndRemoveFromScene(this.debugCubeOptions.debugCube, this.scene)
    this.debugCubeOptions.referenceMesh = null
    this.debugCubeOptions.debugCube = null
  }

  togglePhysicsDebug() {
    this.physics = experience.physics
    if (this.isPhysicsDebugActive) {
      this.physics.debug.disable()
      Object.values(this.world.players).forEach((player) => {
        player.dicesHandler.dicesList.forEach((dice) => {
          dice.group.getObjectByName('upSideDetector').scale.set(new THREE.Vector3(0, 0, 0))
          dice.group.getObjectByName('frontSideDetector').scale.set(new THREE.Vector3(0, 0, 0))
          dice.group.getObjectByName('rightSideDetector').scale.set(new THREE.Vector3(0, 0, 0))
        })
      })
    } else {
      this.physics.debug.enable()
    }
    this.isPhysicsDebugActive = !this.isPhysicsDebugActive
  }

  moveDebugCube() {
    if (this.debugCubeOptions.debugCube && this.input) {
      // move forwards/backwards/left/right
      const delta = this.experience.time.delta * 0.005 // seconds.
      const moveDistance = delta // 200 pixels per second
      const rotateAngle = Math.PI * 0.5 * delta // pi/2 radians (90 degrees) per second

      if (this.input.isKeyPressed('W')) {
        this.debugCubeOptions.debugCube.translateZ(-moveDistance)
      }
      if (this.input.isKeyPressed('S')) {
        this.debugCubeOptions.debugCube.translateZ(moveDistance)
      }
      if (this.input.isKeyPressed('Q')) {
        this.debugCubeOptions.debugCube.translateX(-moveDistance)
      }
      if (this.input.isKeyPressed('E')) {
        this.debugCubeOptions.debugCube.translateX(moveDistance)
      }

      // rotate left/right/up/down
      if (this.input.isKeyPressed('A')) {
        this.debugCubeOptions.debugCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle)
      }
      if (this.input.isKeyPressed('D')) {
        this.debugCubeOptions.debugCube.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle)
      }
      if (this.input.isKeyPressed('R')) {
        this.debugCubeOptions.debugCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotateAngle)
      }
      if (this.input.isKeyPressed('F')) {
        this.debugCubeOptions.debugCube.rotateOnAxis(new THREE.Vector3(1, 0, 0), -rotateAngle)
      }

      if (this.input.isKeyPressed('Z')) {
        this.debugCubeOptions.debugCube.position.set(0, 25.1, 0)
        this.debugCubeOptions.debugCube.rotation.set(0, 0, 0)
      }

      // global coordinates
      if (this.input.isKeyPressed('left')) {
        this.debugCubeOptions.debugCube.position.x -= moveDistance
      }
      if (this.input.isKeyPressed('right')) {
        this.debugCubeOptions.debugCube.position.x += moveDistance
      }
      if (this.input.isKeyPressed('up')) {
        this.debugCubeOptions.debugCube.position.z -= moveDistance
      }
      if (this.input.isKeyPressed('down')) {
        this.debugCubeOptions.debugCube.position.z += moveDistance
      }
      if (this.input.isKeyPressed('t')) {
        this.debugCubeOptions.debugCube.position.y += moveDistance
      }
      if (this.input.isKeyPressed('g')) {
        this.debugCubeOptions.debugCube.position.y -= moveDistance
      }
    }
  }

  update() {
    this.moveDebugCube()
  }
}
