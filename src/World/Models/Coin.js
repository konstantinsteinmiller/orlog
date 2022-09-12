import Experience from '@/Experience.js'
import { isWithinRange } from '@/Utils/math.js'
import { gsap as g } from 'gsap'

export default class {
  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.physics = this.experience.physics
    this.scene = this.experience.scene

    this.setMesh()
    this.setBody()
  }

  setMesh() {
    this.mesh = this.resources.items.coin.scene.children[0]
    this.mesh.position.copy(new THREE.Vector3(-5, 6.1, 0))
    this.mesh.scale.set(1, 1, 1)

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  setBody() {
    this.physics.add.existing(this.mesh, {
      mass: 550,
      collisionFlags: 0,
      shape: 'cylinder',
      width: 1,
      height: 0.2,
      depth: 1,
      // breakable: true,
      // fractureImpulse: 5,
      // collisionFlags: 3,
    })
    this.mesh.body.setBounciness(0.1)
    this.mesh.body.setAngularVelocity(Math.random() * 12 + 5, 0, 0)
    // const force = 30
    // const sphere = this.physics.add.sphere(
    //   {
    //     radius: 0.15,
    //     x: -5,
    //     y: 6,
    //     z: 0,
    //     mass: 20,
    //     bufferGeometry: true,
    //   },
    //   { phong: { color: 0x202020 } },
    // )
    // sphere.body.setBounciness(0.2)
    // sphere.body.applyForce(0, 6 * force, 0 * force)
  }

  flipCoin() {
    const flipInterval = setInterval(() => {
      if (this.mesh.position.y < 0.5) {
        this.mesh.body.setAngularVelocity(0, 0, 0)
        this.mesh.body.setVelocity(0, 0, 0)
        clearInterval(flipInterval)
        setTimeout(() => {
          this.moveCoinToStartingPlayer()
        }, 1000)
      }
    }, 50)
  }

  moveCoinToStartingPlayer() {
    let isAxesUp =
      isWithinRange(this.mesh.body.rotation.x, -0.1, 0.1) ||
      isWithinRange(this.mesh.body.rotation.x, Math.PI * 2 - 0.1, Math.PI * 2 + 0.1)

    // isAxesUp ? console.log('AXES UP - Player One starts') : console.log('ARROWS up - Player Two starts')

    const direction = isAxesUp ? 1 : -1
    const angularDirection = isAxesUp ? 1 : -2

    this.mesh.body.setCollisionFlags(2)
    this.physics.destroy(this.mesh.body)

    g.to(this.mesh.rotation, {
      x: (Math.PI + Math.PI * angularDirection) * direction,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: 'sine.out',
      delay: 0.3,
    })
    g.to(this.mesh.position, {
      x: -5,
      y: 2.4,
      z: 1 * direction,
      duration: 1,
      ease: 'sine.out',
      delay: 0,
    })
      .then(() => {
        g.to(this.mesh.position, {
          x: -5,
          y: 0.1,
          z: 2 * direction,
          duration: 1,
          ease: 'sine.out',
          delay: 0,
        })
      })
      .then(() => {
        // const world = this.experience.world
        // const firstPlayer = world.players[world.orderedPlayerIds[0]]
        // const secondPlayer = world.players[world.orderedPlayerIds[1]]
        // firstPlayer.isPlayerAtTurn = isAxesUp
        // secondPlayer.isPlayerAtTurn = !isAxesUp
        // firstPlayer.isStartingPlayer = isAxesUp
        // secondPlayer.isStartingPlayer = !isAxesUp
        //
        // firstPlayer.dicesHandler.createDices()
        // secondPlayer.dicesHandler.createDices()
        // // start AI
        // secondPlayer?.strategyManager?.addAssessDices()
      })

    const world = this.experience.world
    const firstPlayer = world.players[world.orderedPlayerIds[0]]
    const secondPlayer = world.players[world.orderedPlayerIds[1]]
    // firstPlayer.isPlayerAtTurn = isAxesUp
    // secondPlayer.isPlayerAtTurn = !isAxesUp
    firstPlayer.isPlayerAtTurn = false
    secondPlayer.isPlayerAtTurn = true
    firstPlayer.isStartingPlayer = false
    secondPlayer.isStartingPlayer = true

    firstPlayer.dicesHandler.createDices()
    secondPlayer.dicesHandler.createDices()
    // start AI
    secondPlayer?.strategyManager?.addAssessDices()
  }
}
