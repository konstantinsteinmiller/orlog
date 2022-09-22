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
    this.gui = null
    this.physics = experience.physics
    this.players = {}
    this.orderedPlayerIds = []

    this.currentGamePhase = GAMES_PHASES.DICE_ROLL
    this.playerDoneWithRollingAmount = 0
    this.faithReachedByPlayer = {}
    this.playerDoneWithFaithCastingAmount = 0
    this.playerDoneWithDiceResolveAmount = 0
    this.runeResolver = null
    this.diceResolver = null
    this.round = 1

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
    this.runeResolver = null
    this.diceResolver = null
    this.round = 1
  }

  setupWorld() {
    // Setup
    doGoToMainMenuId.addEventListener('click', (e) => this.onBackToMainClick(e, true))
    doRestartGameId.addEventListener('click', (e) => this.onRestartGameClick(e, true))
    this.floor = new Floor()
    this.environment = new Environment()
    this.createPlayers()
    this.gui = new GUI()
    this.coin = new Coin()
    this.coin.flipCoin()
    this.runeManager = new RuneManager()
  }

  onBackToMainClick() {
    console.log('onBackToMainClick: ')
  }

  onRestartGameClick() {
    console.log('onRestartGameClick')
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
      const sessionPlayer = this.getSessionPlayerId()
      const remotePlayer = 'xxxxxxxx'
      this.createPlayer(sessionPlayer, true)
      this.createPlayer(remotePlayer)
    }
    this.diceArrangeManager = new DiceArrangeManager()
  }

  // find the player that is not at turn and give turn to him
  async switchPlayerAtTurn() {
    Object.values(this.players).forEach((player) => {
      player.isPlayerAtTurn = !player.isPlayerAtTurn
    })

    return await this.coin.moveTurnCoinToPlayerAtTurn(this.getPlayerAtTurn())
  }

  switchStartingPlayer() {
    this.coin.moveCoinToStartingPlayer(true)
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

    player.on(GAMES_PHASES.DICE_ROLL, async () => {
      await this.switchPlayerAtTurn()
      const player = this.getPlayerAtTurn()

      const MAX_THROWS =
        this.debug.isActive && this.debug.useDebugThrows
          ? +window.location.hash.split('throws=')[1].split('&')[0]
          : MAX_DICE_THROWS
      if (player.dicesHandler.availableThrows === MAX_THROWS) {
        this.round === 1 && player.dicesHandler.createDices()
        player.dicesHandler.randomDiceThrow()
      }
      // this.debug.isActive && console.log(player.playerId, ' throws: ', player.dicesHandler.availableThrows)

      if (player.dicesHandler.availableThrows > 0) {
        player.dicesHandler.resetThrow()
      } else if (!this.faithReachedByPlayer[player.playerId]) {
        this.faithReachedByPlayer[player.playerId] = true
        player.trigger(GAMES_PHASES.FAITH_CASTING)
        this.playerDoneWithRollingAmount < 2 &&
          setTimeout(() => {
            player.trigger(GAMES_PHASES.DICE_ROLL)
          }, 400)
      } else if (this.playerDoneWithRollingAmount < 2) {
        player.trigger(GAMES_PHASES.DICE_ROLL)
      }
    })

    player.on('dices-rebuild', () => {
      const player = this.getPlayerAtTurn()
      player.dicesHandler.randomDiceThrow()
    })

    player.on(GAMES_PHASES.FAITH_CASTING, () => {
      // this.debug.isActive && console.log('FAITH_CASTING: ', player.playerId)
      if (++this.playerDoneWithRollingAmount >= 2 && Object.keys(this.faithReachedByPlayer).length === 2) {
        this.currentGamePhase = GAMES_PHASES.FAITH_CASTING
        this.gui.showPhaseOverlay(true)
        this.setPlayerAtTurnToStartingPlayer()
        const playerAtTurn = this.getPlayerAtTurn()

        playerAtTurn.startFaithSelection()
      }
    })

    player.on(GAMES_PHASES.DICE_RESOLVE, async () => {
      ++this.playerDoneWithFaithCastingAmount
      if (this.playerDoneWithFaithCastingAmount < 2) {
        await this.switchPlayerAtTurn()
        const playerAtTurn = this.getPlayerAtTurn()
        playerAtTurn.startFaithSelection()
      }
      if (this.playerDoneWithFaithCastingAmount === 2) {
        this.currentGamePhase = GAMES_PHASES.DICE_RESOLVE
        this.gui.showPhaseOverlay(true)
        this.setPlayerAtTurnToStartingPlayer()

        if (this.runeResolver === null) {
          this.runeResolver = new RuneResolver()
        }

        if (this.diceResolver === null) {
          this.diceResolver = new DiceResolver()
        }
        this.diceResolver.setAllDicesList()
        await this.runeResolver.resolveRunesBeforeDiceResolution()
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

  async finishRound() {
    this.round++
    this.currentGamePhase = GAMES_PHASES.DICE_ROLL
    this.gui.showPhaseOverlay(true)
    this.faithReachedByPlayer = {}
    this.playerDoneWithRollingAmount = 0
    this.playerDoneWithFaithCastingAmount = 0
    this.playerDoneWithDiceResolveAmount = 0

    const firstPlayer = this.players[this.orderedPlayerIds[0]]
    const secondPlayer = this.players[this.orderedPlayerIds[1]]
    const MAX_THROWS =
      this.debug.isActive && this.debug.useDebugThrows
        ? +window.location.hash.split('throws=')[1].split('&')[0]
        : MAX_DICE_THROWS

    firstPlayer.dicesHandler.availableThrows = MAX_THROWS
    secondPlayer.dicesHandler.availableThrows = MAX_THROWS
    firstPlayer.dicesHandler.dicesList.forEach((die) => {
      die.highlightMesh.isPlaced = false
      die.highlightMesh.isSelected = false
      die.isMarkedForRemoval = false
    })
    secondPlayer.dicesHandler.dicesList.forEach((die) => {
      die.highlightMesh.isPlaced = false
      die.highlightMesh.isSelected = false
      die.isMarkedForRemoval = false
    })

    this.switchStartingPlayer()
    // this.coin.moveCoinToStartingPlayer()
    // !firstPlayer?.isStartingPlayer && firstPlayer.trigger(GAMES_PHASES.DICE_ROLL)
    // !secondPlayer?.isStartingPlayer && secondPlayer.trigger(GAMES_PHASES.DICE_ROLL)
  }

  async setPlayerAtTurnToStartingPlayer() {
    const startingPlayer = this.getStartingPlayer()
    const secondPlayer = this.getStartingPlayer(true)
    startingPlayer.isPlayerAtTurn = true
    secondPlayer.isPlayerAtTurn = false
    await this.coin.moveTurnCoinToPlayerAtTurn(startingPlayer)
  }

  getSessionPlayerId() {
    return getStorage(GAME_PLAYER_ID, true)
  }

  getSessionPlayer() {
    return Object.values(this.players).find((player) => player.playerId === getStorage(GAME_PLAYER_ID, true))
  }

  getEnemyPlayer(playerId) {
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

  isDiceResolutionPhase() {
    return this.currentGamePhase === GAMES_PHASES.DICE_RESOLVE
  }

  checkWinConditions(defenderPlayer) {
    const attackerPlayer = this.getEnemyPlayer(defenderPlayer.playerId)
    if (defenderPlayer.lifeStones.length === 0) {
      const $winnerSpan = document.querySelector('#gameOverModal+.modal .winner')
      $winnerSpan.innerText = `${attackerPlayer.playerId} won!!!`
      gameOverModal.click()
      alert(attackerPlayer.playerId, ' won!!!')
    }
  }

  update() {
    Object.values(this.players).forEach((player) => {
      player?.update()
    })
    this.runeManager?.update()
  }
}
