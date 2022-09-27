import { groupBySymbol, sortByUpwardSymbol } from '@/Utils/utils.js'
import Experience from '@/Experience.js'
import { GAME_SYMBOLS } from '@/Utils/constants.js'

export default class DiceArrangeManager {
  constructor() {
    this.experience = new Experience()
    this.world = this.experience.world

    this.startingAxes = []
    this.startingArrows = []
    this.startingHelms = []
    this.startingShields = []
    this.startingHands = []

    this.otherAxes = []
    this.otherArrows = []
    this.otherHelms = []
    this.otherShields = []
    this.otherHands = []
  }

  rearrangePlacedDices() {
    this.startingAxes = []
    this.startingArrows = []
    this.startingHelms = []
    this.startingShields = []
    this.startingHands = []

    this.otherAxes = []
    this.otherArrows = []
    this.otherHelms = []
    this.otherShields = []
    this.otherHands = []

    const startingPlayer = this.world.getStartingPlayer(false)
    const otherPlayer = this.world.getStartingPlayer(true)

    const startingPlayerSortedDicesList = startingPlayer.dicesHandler.dicesList
      .filter((dice) => dice.highlightMesh?.isPlaced || dice.highlightMesh?.isSelected)
      .sort(sortByUpwardSymbol)
      .filter(
        groupBySymbol([
          this.startingAxes,
          this.startingArrows,
          this.startingHelms,
          this.startingShields,
          this.startingHands,
        ]),
      )

    const otherPlayerSortedDicesList = otherPlayer.dicesHandler.dicesList
      .filter((dice) => dice.highlightMesh?.isPlaced || dice.highlightMesh?.isSelected)
      .sort(sortByUpwardSymbol)
      .filter(
        groupBySymbol([
          this.otherAxes,
          this.otherArrows,
          this.otherHelms,
          this.otherShields,
          this.otherHands,
        ]),
      )

    const bothPlayersSortedDicesList = startingPlayerSortedDicesList.concat(otherPlayerSortedDicesList)

    // console.log(
    //   'this.sortedDicesList: ',
    //   bothPlayersSortedDicesList.map((dice) => dice.mesh.userData.upwardSymbol),
    // )

    this.startingIndecies = {
      [GAME_SYMBOLS.AXE]: Math.max(this.startingAxes.length, this.otherHelms.length),
      [GAME_SYMBOLS.ARROW]: Math.max(this.startingArrows.length, this.otherShields.length),
      [GAME_SYMBOLS.HELM]: Math.max(this.startingHelms.length, this.otherAxes.length),
      [GAME_SYMBOLS.SHIELD]: Math.max(this.startingShields.length, this.otherArrows.length),
      [GAME_SYMBOLS.HAND]: Math.max(this.startingHands.length, this.otherHands.length),
    }

    // starting AXES
    this.startingAxes.forEach((dice, index) => {
      dice.positionIndex = index
    })
    this.otherHelms.forEach((dice, index) => {
      dice.positionIndex = index
    })

    // starting ARROWS
    this.startingArrows.forEach((dice, index) => {
      dice.positionIndex = this.startingIndecies[GAME_SYMBOLS.AXE] + index
    })
    this.otherShields.forEach((dice, index) => {
      dice.positionIndex = this.startingIndecies[GAME_SYMBOLS.AXE] + index
    })

    // starting HELMS
    this.startingHelms.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] + this.startingIndecies[GAME_SYMBOLS.ARROW] + index
    })
    this.otherAxes.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] + this.startingIndecies[GAME_SYMBOLS.ARROW] + index
    })

    // starting SHIELDS
    this.startingShields.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] +
        this.startingIndecies[GAME_SYMBOLS.ARROW] +
        this.startingIndecies[GAME_SYMBOLS.HELM] +
        index
    })
    this.otherArrows.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] +
        this.startingIndecies[GAME_SYMBOLS.ARROW] +
        this.startingIndecies[GAME_SYMBOLS.HELM] +
        index
    })

    // starting HANDS
    this.startingHands.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] +
        this.startingIndecies[GAME_SYMBOLS.ARROW] +
        this.startingIndecies[GAME_SYMBOLS.HELM] +
        this.startingIndecies[GAME_SYMBOLS.SHIELD] +
        index
    })
    this.otherHands.forEach((dice, index) => {
      dice.positionIndex =
        this.startingIndecies[GAME_SYMBOLS.AXE] +
        this.startingIndecies[GAME_SYMBOLS.ARROW] +
        this.startingIndecies[GAME_SYMBOLS.HELM] +
        this.startingIndecies[GAME_SYMBOLS.SHIELD] +
        index
    })
    // console.log(
    //   'startingPlayerSortedDicesList: ',
    //   startingPlayerSortedDicesList.map((dice) => dice.positionIndex),
    //   otherPlayerSortedDicesList.map((dice) => dice.positionIndex),
    // )
    // console.log('startingPlayerSortedDicesList: ', startingPlayerSortedDicesList, otherPlayerSortedDicesList)
    this.world.maxPositionIndex = this.getSumOfObjectValues(this.startingIndecies)
  }

  getSumOfObjectValues(object) {
    return Object.values(object).reduce((sum, curr) => (sum += curr), 0)
  }
}
