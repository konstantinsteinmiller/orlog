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
import { getStorage, setStorage } from '@/Utils/storage.js'
import DiceResolver from '@/World/DiceResolver.js'
import RuneResolver from '@/World/RuneResolver.js'
import GUI from '@/Menus/GUI.js'
import RuneManager from '@/World/RuneManager.js'

export default class World {
  constructor() {
    this.experience = experience
    this.scene = experience.scene
    this.debug = experience.debug
    this.sounds = experience.sounds
    this.resources = experience.resources
    this.bowls = []
    this.gui = null
    this.physics = experience.physics
    this.players = {}
    this.orderedPlayerIds = []

    this.currentGamePhase = GAMES_PHASES.DICE_ROLL
    this.playerDoneWithRollingAmount = 0
    this.playerDoneWithFaithCastingAmount = 0
    this.playerDoneWithDiceResolveAmount = 0
    this.runeResolver = null
    this.diceResolver = null

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
    this.playerDoneWithDiceResolveAmount = 0
    this.diceResolver = null
  }

  setupWorld() {
    // Setup
    this.floor = new Floor()
    this.environment = new Environment()
    this.createPlayers()
    this.gui = new GUI()
    this.coin = new Coin()
    this.coin.flipCoin()
    this.runeManager = new RuneManager()
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
      const sessionPlayer = getStorage(GAME_PLAYER_ID, true)
      const remotePlayer = 'xxxxxxxx'
      this.createPlayer(sessionPlayer, true)
      this.createPlayer(remotePlayer)
    }
    this.diceArrangeManager = new DiceArrangeManager()
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
        //  both players finished with  GAMES_PHASES.DICE_ROLL
        // this.debug.isActive && console.log('========= both players finished with  GAMES_PHASES.DICE_ROLL')
      }
    })
    player.on('dices-rebuild', () => {
      const player = this.getPlayerAtTurn()
      player.dicesHandler.randomDiceThrow()
    })
    player.on(GAMES_PHASES.FAITH_CASTING, () => {
      // this.debug.isActive && console.log('FAITH_CASTING: ', player.playerId)
      if (++this.playerDoneWithRollingAmount === 2) {
        this.currentGamePhase = GAMES_PHASES.FAITH_CASTING
        this.gui.showPhaseOverlay(true)
        this.setPlayerAtTurnToStartingPlayer()
        const startingPlayer = this.getStartingPlayer()
        const secondPlayer = this.getStartingPlayer(true)
        startingPlayer.startFaithSelection()
        // setTimeout(() => {
        // this.debug.isActive && startingPlayer.trigger(GAMES_PHASES.DICE_RESOLVE)
        // this.debug.isActive && secondPlayer.trigger(GAMES_PHASES.DICE_RESOLVE)
        // }, 4000)
      }
    })

    player.on(GAMES_PHASES.DICE_RESOLVE, async () => {
      if (++this.playerDoneWithFaithCastingAmount === 2) {
        this.currentGamePhase = GAMES_PHASES.DICE_RESOLVE
        this.gui.showPhaseOverlay(true)
        this.setPlayerAtTurnToStartingPlayer()

        if (this.runeResolver === null) {
          this.runeResolver = new RuneResolver()

          await this.runeResolver.resolveRunesBeforeDiceResolution()
        }
        if (this.diceResolver === null) {
          this.diceResolver = new DiceResolver()
        }
      }
    })

    player.on(GAMES_PHASES.FAITH_RESOLVE, () => {
      if (++this.playerDoneWithDiceResolveAmount === 2) {
        // this.currentGamePhase = GAMES_PHASES.FAITH_RESOLVE
        // this.gui.showPhaseOverlay(true)
        // this.setPlayerAtTurnToStartingPlayer()
        // this.debug.isActive && console.log('Phase - FAITH_RESOLVE: ', player.playerId)
      }
    })

    return player
  }

  setPlayerAtTurnToStartingPlayer() {
    const [startingPlayer, secondPlayer] = this.getPlayers()
    // const secondPlayer = this.getStartingPlayer(false)
    startingPlayer.isPlayerAtTurn = true
    secondPlayer.isPlayerAtTurn = false
  }

  getSessionPlayerId() {
    return getStorage(GAME_PLAYER_ID, true)
  }

  getSessionPlayer() {
    return Object.values(this.players).find((player) => player.playerId === getStorage(GAME_PLAYER_ID, true))
  }

  getEnemyPlayer(playerId) {
    // const sessionPlayerId = getStorage(GAME_PLAYER_ID, true)
    return Object.values(this.players).find((player) => player.playerId !== playerId)
  }

  isSessionPlayerAtTurn() {
    return this.getPlayerAtTurn()?.playerId === this.getSessionPlayerId()
  }

  isDiceRollPhase() {
    return this.currentGamePhase === GAMES_PHASES.DICE_ROLL
  }

  isFaithCastingPhase() {
    return this.currentGamePhase === GAMES_PHASES.FAITH_CASTING
  }

  update() {
    Object.values(this.players).forEach((player) => {
      player?.update()
    })
    this.runeManager?.update()
  }
}
