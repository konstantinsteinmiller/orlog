import Experience from '@/Experience.js'
import { GAME_PLAYER_TYPES, DICE_FACES_MAP, GAME_SYMBOLS } from '@/Utils/constants.js'

export default class StrategyManager {
  constructor(player) {
    this.experience = new Experience()
    this.world = this.experience.world
    this.player = player
    this.dicesHandler = player.dicesHandler
    this.selectedDices = []

    this.dicesHandler.on('dices-stopped', () => {
      // console.log('dices-stopped: ')
      // this.addAssessDices()
    })
    this.dicesHandler.on('faces-evaluated', () => {
      // console.log('faces-evaluated: ')
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
    let enemyHands = 0
    this.dicesHandler.dicesList.forEach((dice) => {
      const diceHighlight = dice.highlightMesh
      if (diceHighlight.isPlaced) {
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && collectedAxes++
        dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW && collectedArrows++
        unselectedDices--
        return
      }
      // console.log(
      //   'dice.mesh.userData: ',
      //   dice.mesh,
      //   dice.mesh.userData,
      //   dice.mesh.userData.upwardSymbol,
      //   `${dice.mesh.userData.isGoldenSymbol ? 'isGolden' : ''}`,
      // )
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
    console.log('enemyPlayer: ', enemyPlayer)
    let enemyAxes = 0
    let enemyArrows = 0
    console.log('enemyAxes, enemyArrows: ', enemyAxes, enemyArrows)
    enemyPlayer.dicesHandler.dicesList.forEach((dice) => {
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && enemyAxes++
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW && enemyArrows++
      dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.HAND && enemyHands++
    })

    console.log('goldenDices: ', goldenDices.length)
    let targetList = []
    if (enemyAxes > 0) {
      targetList.push(axesDices)
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }
    if (enemyArrows > 0) {
      targetList.push(arrowDices)
      this.addAvailableToSelectedDices(unselectedDices, targetList)
    }

    if (handDices.length && enemyPlayer.lifeStones.length >= 2) {
      targetList.push(arrowDices)
    }

    // prefer collecting golden dices
    if (this.hasHighHP()) {
      // this.selectedDices.push(goldenDices)

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
      // this.selectedDices.push(goldenDices)
      // this.selectedDices.push(axesDices)
      // this.selectedDices.push(arrowDices)

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

    // let him look like hes thinking

    setTimeout(() => {
      this.selectDices()
    }, 3000)
  }

  addAvailableToSelectedDices(unselectedDices, listOfDicesList) {
    let currentList = null
    while (unselectedDices > 0) {
      if (currentList?.length > 0) {
        console.log('add dice to selection', unselectedDices)
        this.selectedDices.push(currentList.shift())
        unselectedDices--
      }
      if (listOfDicesList.length > 0 && (currentList === null || currentList.length === 0)) {
        currentList = listOfDicesList.shift()
      } else if (listOfDicesList.length === 0 && currentList.length === 0) {
        unselectedDices = 0
      }
    }
    console.log('this.selectedDices, listOfDicesList: ', this.selectedDices, listOfDicesList)
  }

  selectDices() {
    this.selectedDices.forEach((dice) => {
      dice.toggleDice(true, true)
    })
    setTimeout(() => {
      this.moveDicesToEnemy()
    }, 1500)
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
