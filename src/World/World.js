import Environment from '@/World/Environment.js'
import Floor from '@/World/Models/Floor.js'
import Player from '@/World/Player.js'
import Coin from '@/World/Models/Coin.js'
import { GAME_TYPES, GAME_PLAYER_TYPES, GAMES_PHASES } from '@/Utils/constants.js'

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
    this.orderedPlayerIds = []

    const direction = this.isPlayer ? 1 : -1
    this.midZOffset = 5
    this.offsetDirection = direction

    this.playerDoneWithRollingAmount = 0

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
    this.coin = new Coin()
    this.coin.flipCoin()
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

  getPlayer(playerIndex) {
    return this.players[this.orderedPlayerIds[playerIndex]]
  }

  // find the player that is not at turn and give turn to him
  switchPlayerAtTurn() {
    Object.values(this.players).forEach((player) => {
      player.isPlayerAtTurn = !player.isPlayerAtTurn
    })
  }

  getPlayerAtTurn() {
    return Object.values(this.players).find((player) => player.isPlayerAtTurn)
  }

  createPlayer(playerId, isPlayer) {
    const player = new Player(playerId, !!isPlayer)
    this.players[playerId] = player
    this.orderedPlayerIds.push(playerId)

    player.on(GAMES_PHASES.DICE_ROLL, () => {
      this.switchPlayerAtTurn()
      const player = this.getPlayerAtTurn()
      console.log('player.dicesHandler.availableThrows: ', player.dicesHandler.availableThrows)
      if (player.dicesHandler.availableThrows === 3) {
        player.dicesHandler.createDices()
        player.dicesHandler.randomDiceThrow()
      } else {
      }
      player.dicesHandler.resetThrow()
      player.dicesHandler.throwOnNextCycle = true
      // setTimeout(() => {
      //
      // }, 1000)
    })
    player.on('dices-rebuild', () => {
      const player = this.getPlayerAtTurn()
      player.dicesHandler.randomDiceThrow()
    })
    player.on(GAMES_PHASES.FAITH_CASTING, () => {
      if (++this.playerDoneWithRollingAmount === 2) {
        const player = this.getPlayer(0)
        player?.isStartingPlayer && player.startFaithSelection()
      }
    })
    player.on(GAMES_PHASES.DICE_RESOLVE, () => {})
    player.on(GAMES_PHASES.FAITH_RESOLVE, () => {})

    return player
  }

  update() {
    Object.values(this.players).forEach((player) => {
      player?.update()
    })
  }
}
