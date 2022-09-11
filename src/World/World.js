import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import Player from '@/World/Player.js'
import { GAME_TYPES, GAME_PLAYER_TYPES } from '@/Utils/constants.js'

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.debug = experience.debug
    this.sounds = experience.sounds
    this.resources = experience.resources
    this.bowls = []
    this.physics = experience.physics
    this.isPlayer = true
    this.players = {}

    const direction = this.isPlayer ? 1 : -1
    this.midZOffset = 5
    this.offsetDirection = direction

    // const axisHelper = new THREE.AxesHelper(3)
    // this.scene.add(axisHelper)

    // Wait for resources
    if (this.resources.isReady) {
      setTimeout(() => {
        this.setupWorld()
      })
    } else {
      this.resources.on('ready', () => {
        this.setupWorld()
      })
    }
  }

  setupWorld() {
    // Setup
    this.floor = new Floor()
    this.environment = new Environment()
    this.createPlayers()
  }

  createPlayers() {
    this.players = {}

    if (this.experience.gameMode === GAME_TYPES.GAME_TYPE_NPC) {
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER, true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC)
    } else if (this.experience.gameMode === GAME_TYPES.GAME_TYPE_MULTIPLAYER) {
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER, true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC)
    }
  }
  createPlayer(playerId, isPlayer) {
    this.players[playerId] = new Player(playerId, !!isPlayer)
  }

  update() {
    Object.values(this.players).forEach((player) => {
      player.update()
    })
  }
}
