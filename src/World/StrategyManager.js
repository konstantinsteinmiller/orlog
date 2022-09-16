import Experience from '@/Experience.js'
import { GAME_PLAYER_TYPES, GAME_SYMBOLS } from '@/Utils/constants.js'

export default class StrategyManager {
  constructor(player) {
    this.experience = new Experience()
    this.world = this.experience.world
    this.player = player
    this.dicesHandler = player.dicesHandler
    this.selectedDices = []

    this.dicesHandler.on('dices-stopped', () => {})
    this.dicesHandler.on('faces-evaluated', () => {
      this.addAssessDices()
    })
  }

  addAssessDices() {
    if (this.player.isPlayerAtTurn && this.player.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC) {
      this.assessDiceSelection()
    }
  }

  assessDiceSelection() {
    const goldenDices = []
    const axesDices = []
    const arrowDices = []
    const helmDices = []
    const shieldDices = []
    const handDices = []
    let unselectedDices = 6
    let collectedAxes = 0
    let collectedArrows = 0
    let collectedHelms = 0
    let collectedShields = 0
    let enemyHands = 0
    let enemyAxes = 0
    let enemyArrows = 0

    this.dicesHandler.dicesList.forEach((dice) => {
      const diceHighlight = dice.highlightMesh
      if (diceHighlight.isPlaced) {
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && collectedAxes++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW && collectedArrows++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.HELM && collectedHelms++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.SHIELD && collectedShields++
        unselectedDices--
        return
      }

      dice.mesh.userData.isGoldenSymbol && goldenDices.push(dice)
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && axesDices.push(dice)
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW && arrowDices.push(dice)
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.HELM && helmDices.push(dice)
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.SHIELD && shieldDices.push(dice)
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.HAND && handDices.push(dice)
    })

    const enemyPlayer =
      this.world.players[
        Object.keys(this.world.players).find((playerId) => playerId !== this.player.playerId)
      ]

    enemyPlayer.dicesHandler.dicesList.forEach((dice) => {
      if (dice.highlightMesh?.isPlaced) {
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && enemyAxes++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW && enemyArrows++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.HAND && enemyHands++
      }
    })

    let targetList = []
    if (enemyAxes > 0) {
      const helmsToAdd = enemyAxes - collectedHelms
      helmsToAdd >= 1 && targetList.push(helmDices.slice(0, helmsToAdd))
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }
    if (enemyArrows > 0) {
      const shieldsToAdd = enemyArrows - collectedShields
      shieldsToAdd >= 1 && targetList.push(shieldDices.slice(0, shieldsToAdd))
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }

    if (arrowDices.length && enemyPlayer.lifeStones.length <= 5) {
      targetList.push(arrowDices)
    }

    // prefer collecting golden dices
    if (this.hasHighHP()) {
      targetList.push(goldenDices)

      if (handDices.length && enemyPlayer.faithTokens.length >= 2) {
        targetList.push(handDices)
      }
      if ((axesDices.length >= 2 && collectedAxes >= 1) || axesDices.length >= 3) {
        targetList.push(axesDices)
      }
      if ((arrowDices.length >= 2 && collectedArrows >= 1) || arrowDices.length >= 3) {
        targetList.push(arrowDices)
      }
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }

    // prefer collecting attack dices and golden
    if (this.hasMediumHP()) {
      if (handDices.length && enemyPlayer.faithTokens.length >= 2) {
        targetList.push(handDices)
      }
      targetList.push(goldenDices, axesDices, arrowDices, handDices)
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }

    // prefer collecting defence dices and attack dices and heals
    if (this.hasCritialHP()) {
      targetList.push(shieldDices, helmDices, goldenDices, handDices, arrowDices, axesDices)
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }

    // let him look like he's thinking
    setTimeout(() => {
      this.selectDices()
    }, 2000)
  }

  addAvailableToSelectedDices(unselectedDices, listOfDicesList) {
    let currentList = []
    while (unselectedDices > 0) {
      if (currentList?.length > 0) {
        // console.log('add dice to selection', unselectedDices)
        this.selectedDices.push(currentList.shift())
        unselectedDices--
      }
      if (listOfDicesList.length > 0 && currentList.length === 0) {
        currentList = listOfDicesList.shift() || []
      } else if (listOfDicesList.length === 0 && currentList?.length === 0) {
        unselectedDices = 0
      }
    }
    // console.log('this.selectedDices, listOfDicesList: ', this.selectedDices, listOfDicesList)
  }

  selectDices() {
    this.selectedDices.forEach((dice) => {
      dice.toggleDice(true, true)
    })
    setTimeout(() => {
      if (
        this.dicesHandler.dicesList.some((dice) => dice.highlightMesh?.isSelected) &&
        this.dicesHandler.availableThrows > 0
      ) {
        this.dicesHandler.didNotSelectAnyDices = false
        this.moveDicesToEnemy()
      } else if (this.dicesHandler.availableThrows > 0) {
        this.dicesHandler.finishMovingDicesToEnemy()
      }
    }, 1000)
  }

  moveDicesToEnemy() {
    this.dicesHandler.moveSelectedDicesToEnemy()
    this.selectedDices = []
  }

  hasHighHP() {
    return this.player.lifeStones.length > 10
  }

  hasMediumHP() {
    return this.player.lifeStones.length <= 10 && this.player.lifeStones.length > 5
  }

  hasCritialHP() {
    return this.player.lifeStones.length <= 5
  }
}
