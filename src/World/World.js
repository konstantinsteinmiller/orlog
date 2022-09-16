import Environment from '@/World/Environment.js'
import DiceArrangeManager from '@/World/DiceArrangeManager.js'
import Floor from '@/World/Models/Floor.js'
import Player from '@/World/Player.js'
import Coin from '@/World/Models/Coin.js'
import {
  GAME_TYPES,
  GAME_PLAYER_TYPES,
  GAMES_PHASES,
  GAME_PLAYER_ID,
  MAX_DICE_THROWS,
} from '@/Utils/constants.js'
import { setStorage } from '@/Utils/storage.js'
import DiceResolver from '@/World/DiceResolver.js'

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

    this.currentGamePhase = GAMES_PHASES.DICE_ROLL
    this.playerDoneWithRollingAmount = 0
    this.playerDoneWithFaithCastingAmount = 0

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

  reset() {
    this.currentGamePhase = GAMES_PHASES.DICE_ROLL
    this.playerDoneWithRollingAmount = 0
    this.playerDoneWithFaithCastingAmount = 0
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
      setStorage(GAME_PLAYER_ID, GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER, true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER, true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC)
    } else if (this.experience.gameMode === GAME_TYPES.GAME_TYPE_MULTIPLAYER) {
      // setStorage(GAME_PLAYER_ID, client.sessionId..., true)
      // setStorage(GAME_PLAYER_ID, client.sessionId..., true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_PLAYER, true)
      this.createPlayer(GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC)
    }
    this.diceArrangeManager = new DiceArrangeManager()
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

  getPlayerAtTurn(isNotAtTurn) {
    return Object.values(this.players).find(
      (player) => (isNotAtTurn && !player.isPlayerAtTurn) || (!isNotAtTurn && player.isPlayerAtTurn),
    )
  }

  getStartingPlayer(isNotStartingPlayer) {
    return Object.values(this.players).find(
      (player) =>
        (isNotStartingPlayer && !player.isStartingPlayer) ||
        (!isNotStartingPlayer && player.isStartingPlayer),
    )
  }

  getPlayers() {
    const playersList = Object.values(this.players)
    return [
      playersList.find((player) => player?.isStartingPlayer),
      playersList.find((player) => !player?.isStartingPlayer),
    ]
  }

  createPlayer(playerId, isPlayer) {
    const player = new Player(playerId, !!isPlayer)
    this.players[playerId] = player
    this.orderedPlayerIds.push(playerId)

    player.on(GAMES_PHASES.DICE_ROLL, () => {
      this.switchPlayerAtTurn()
      const player = this.getPlayerAtTurn()
      if (player.dicesHandler.availableThrows === MAX_DICE_THROWS) {
        player.dicesHandler.createDices()
        player.dicesHandler.randomDiceThrow()
      }
      // this.debug.isActive && console.log(player.playerId, ' throws: ', player.dicesHandler.availableThrows)

      if (player.dicesHandler.availableThrows > 0) {
        player.dicesHandler.resetThrow()
      } else if (this.playerDoneWithRollingAmount === 1) {
        player.trigger(GAMES_PHASES.DICE_ROLL)
      } else {
        //  both players finished with  GAMES_PHASES.FAITH_CASTING
        this.debug.isActive && console.log('========= both players finished with  GAMES_PHASES.FAITH_CASTING')
      }
    })
    player.on('dices-rebuild', () => {
      const player = this.getPlayerAtTurn()
      player.dicesHandler.randomDiceThrow()
    })
    player.on(GAMES_PHASES.FAITH_CASTING, () => {
      // this.debug.isActive && console.log('FAITH_CASTING: ', player.playerId)
      if (++this.playerDoneWithRollingAmount === 2) {
        this.setPlayerAtTurnToStartingPlayer()
        this.currentGamePhase = GAMES_PHASES.FAITH_CASTING
        const startingPlayer = this.getStartingPlayer()
        const secondPlayer = this.getStartingPlayer(true)
        // startingPlayer.startFaithSelection()
        startingPlayer.trigger(GAMES_PHASES.DICE_RESOLVE)
        secondPlayer.trigger(GAMES_PHASES.DICE_RESOLVE)
      }
    })

    player.on(GAMES_PHASES.DICE_RESOLVE, () => {
      if (++this.playerDoneWithFaithCastingAmount === 2) {
        this.setPlayerAtTurnToStartingPlayer()
        this.currentGamePhase = GAMES_PHASES.DICE_RESOLVE
        // this.debug.isActive && console.log('Phase - DICE_RESOLVE: ', player.playerId)
        this.diceResolver = new DiceResolver()
      }
    })

    player.on(GAMES_PHASES.FAITH_RESOLVE, () => {})

    return player
  }

  setPlayerAtTurnToStartingPlayer() {
    const [startingPlayer, secondPlayer] = this.getPlayers()
    // const secondPlayer = this.getStartingPlayer(false)
    startingPlayer.isPlayerAtTurn = true
    secondPlayer.isPlayerAtTurn = false
  }

  update() {
    Object.values(this.players).forEach((player) => {
      player?.update()
    })
  }
}
