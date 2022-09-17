import StrategyManager from '@/World/StrategyManager.js'
import EventEmitter from '@/Utils/EventEmitter.js'
import DicesHandler from '@/World/DicesHandler.js'
import Bowl from '@/World/Models/Bowl.js'
import LifeStone from '@/World/Models/LifeStone.js'
import FaithToken from '@/World/Models/FaithToken.js'
import Rune from '@/World/Models/Rune.js'
import Experience from '@/Experience.js'
import { GAME_PLAYER_TYPES, GAMES_PHASES, GAME_STARTING_LIFE_STONES, GAMES_RUNES } from '@/Utils/constants.js'

export default class Player extends EventEmitter {
  constructor(playerId, isPlayer) {
    super()
    this.experience = new Experience()
    this.debug = this.experience.debug

    this.playerId = playerId
    this.isPlayer = !!isPlayer
    this.lifeStones = []
    this.faithTokens = []
    this.runes = []
    this.isPlayerAtTurn = null
    this.isStartingPlayer = null

    this.init()

    // Debug
    if (this.debug.isActive && !this.isPlayer) {
      this.debugFolder = this.debug.ui.addFolder('player')
      // this.debugFolder
      //   .addColor(this.lifeStones[0].highlightMesh.material, 'color')
      //   .name('color of the lifeStone highlight')
      //   .onChange((color) => {
      //     this.lifeStones.forEach((stone) => {
      //       stone.highlightMesh.material.color = color
      //     })
      //   })
      this.debug.faithTokenAmount = 3
      this.debug.lifeStoneAmount = 2
      this.debugFolder.add(this, 'destroyLifeStones')
      this.debugFolder.add(this.debug, 'lifeStoneAmount', 1, 20, 1)
      this.debugFolder.add(this, 'destroyFaithTokens')
      this.debugFolder.add(this.debug, 'faithTokenAmount', 1, 20, 1)
      this.debugFolder.close()
    }

    // setTimeout(() => {
    //   this.destroyLifeStones(3)
    // }, 2500)
    //
    // setTimeout(() => {
    //   this.destroyFaithTokens(3)
    // }, 5700)
  }

  reset() {
    this.lifeStones = []
    this.faithTokens = []
    this.runes = []
    this.isPlayerAtTurn = null
    this.isStartingPlayer = null
  }

  init() {
    this.dicesHandler = new DicesHandler(this.playerId, this.isPlayer)
    if (!this.isPlayer && this.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC) {
      this.strategyManager = new StrategyManager(this)
    }

    new Bowl(this.isPlayer)
    this.lifeStones = []
    this.faithTokens = []
    this.runes = []
    this.runes = [
      new Rune(0, GAMES_RUNES.RUNE_ANUBIS, this.isPlayer),
      new Rune(1, GAMES_RUNES.RUNE_BAST, this.isPlayer),
      new Rune(2, GAMES_RUNES.RUNE_HORUS, this.isPlayer),
    ]
    this.lifeStones = [...Array(GAME_STARTING_LIFE_STONES).keys()].map(
      (id) => new LifeStone(this.isPlayer, id, id * 0.1),
    )
    // this.faithTokens = [...Array(13).keys()].map((id) => new FaithToken(this.isPlayer, id, id * 0.2))

    this.dicesHandler.on('finished-moving-dices-to-enemy', () => {
      if (this.dicesHandler.dicesList.every((dice) => dice.highlightMesh?.isPlaced)) {
        this.dicesHandler.availableThrows = 0
        this.trigger(GAMES_PHASES.FAITH_CASTING)
      }
      this.trigger(GAMES_PHASES.DICE_ROLL)
    })

    this.dicesHandler.on('dices-rebuild', () => {
      this.trigger('dices-rebuild')
    })

    this.dicesHandler.on(GAMES_PHASES.DICE_ROLL, () => {
      this.trigger(GAMES_PHASES.DICE_ROLL)
    })

    this.dicesHandler.on(GAMES_PHASES.FAITH_CASTING, () => {
      this.trigger(GAMES_PHASES.FAITH_CASTING)
    })

    this.dicesHandler.on(GAMES_PHASES.DICE_RESOLVE, () => {
      this.trigger(GAMES_PHASES.DICE_RESOLVE)
    })

    this.dicesHandler.on(GAMES_PHASES.FAITH_RESOLVE, () => {
      this.trigger(GAMES_PHASES.FAITH_RESOLVE)
    })
  }

  destroyLifeStones(amount) {
    ;[...Array(amount || this.debug.lifeStoneAmount).keys()].forEach((stone, index) => {
      let lifeStone = this.lifeStones.pop()
      lifeStone?.destroyLifeStone(1000 + 200 * index)
      lifeStone = null
    })
  }

  destroyFaithTokens(amount) {
    ;[...Array(amount || this.debug.faithTokenAmount).keys()].forEach((token, index) => {
      let faithToken = this.faithTokens.pop()
      faithToken?.destroyFaithToken(200 * index)
      faithToken = null
    })
  }

  startFaithSelection() {
    console.log('startFaithSelection: ', this.playerId)
  }

  update() {
    this.dicesHandler && this.dicesHandler.update()
  }
}
