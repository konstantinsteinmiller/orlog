import Experience from '@/Experience.js'
import {
  GAME_PLAYER_TYPES,
  GAME_RUNES_DESCRIPTIONS,
  GAME_SYMBOLS,
  GAMES_PHASES,
  GAMES_RUNES,
} from '@/Utils/constants.js'

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
    if (
      this.player.isPlayerAtTurn &&
      this.player.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC &&
      this.dicesHandler.availableThrows > 0
    ) {
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
      this.dicesHandler.evaluateTopFace()
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

  selectRune() {
    const randomRuneSelection =
      this.experience.debug.isActive && this.experience.debug.useDebugNpcRune
        ? +window.location.hash.split('rune=')[1].split('&')[0]
        : Math.ceil(Math.random() * 3) - 1
    let rune = this.player.runes[randomRuneSelection]
    let runeData = GAME_RUNES_DESCRIPTIONS[rune.type]
    let selectedTier = null

    if (this.hasHighHP()) {
      selectedTier = this.selectHighestAvailableTier(runeData)
    }

    if (this.hasMediumHP()) {
      rune = this.player.runes.find((rune) => rune.type === GAMES_RUNES.RUNE_TAWARET) || rune
      runeData = GAME_RUNES_DESCRIPTIONS[rune.type]
      selectedTier = this.selectHighestAvailableTier(runeData)
    }

    if (this.hasCritialHP()) {
      rune = this.player.runes.find((rune) => rune.type === GAMES_RUNES.RUNE_TAWARET) || rune
      runeData = GAME_RUNES_DESCRIPTIONS[rune.type]
      selectedTier = this.selectHighestAvailableTier(runeData)
    }

    this.player.selectedRune = selectedTier
      ? {
          rune: rune,
          type: rune.type,
          resolution: runeData.resolution,
          tier: selectedTier /* `tier${Math.ceil(Math.random() * 3)}` */,
        }
      : null
    setTimeout(() => {
      selectedTier && rune.toggleRune(false, true)
      this.player.trigger(GAMES_PHASES.DICE_RESOLVE)
    }, 1500)
  }

  selectHighestAvailableTier(runeData) {
    const faithTokenAmount = this.player.faithTokens.length
    return Object.keys(runeData)
      .filter((key) => key.includes('tier'))
      .sort((a, b) => b.substring(4) - a.substring(4))
      .find((tier) => faithTokenAmount >= +runeData[tier].cost.faith)
  }

  async selectEnemyDices(diceToSelectAmount) {
    const defenderPlayer = this.world.getSessionPlayer()
    const dicesToRemoveList = [...Array(defenderPlayer.dicesHandler.dicesList.length).keys()]
      .sort((a, b) => 0.5 - Math.random())
      .slice(0, diceToSelectAmount)

    const attackerDices = {
      AXE: 0,
      ARROW: 0,
      HELM: 0,
      SHIELD: 0,
      HAND: 0,
    }
    const defenderDices = {
      AXE: 0,
      ARROW: 0,
      HELM: 0,
      SHIELD: 0,
      HAND: 0,
    }
    defenderPlayer.dicesHandler.dicesList.forEach((die) => {
      const symbol = die?.mesh?.userData?.upwardSymbol
      defenderDices[symbol] = defenderDices[symbol]++
    })
    this.dicesHandler.dicesList.forEach((die) => {
      const symbol = die?.mesh?.userData?.upwardSymbol
      attackerDices[symbol] = attackerDices[symbol]++
    })

    let toRemoveDices = []
    /* first prefer golden axes if enemy got more axes than you got helms */
    if (attackerDices['HELM'] < defenderDices['AXE']) {
      const times = defenderDices['AXE'] - attackerDices['HELM']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('AXE')
      })
    }
    /* second prefer golden arrows if enemy got more axes than you got shield */
    if (attackerDices['SHIELD'] < defenderDices['ARROW']) {
      const times = defenderDices['ARROW'] - attackerDices['SHIELD']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('ARROW')
      })
    }
    /* third prefer removing enemy shields(golden) if you got arrows */
    if (defenderDices['SHIELD'] > 0 && attackerDices['ARROW'] > 0) {
      ;[...Array(defenderDices['SHIELD']).keys()].forEach(() => {
        toRemoveDices.push('SHIELD')
      })
    }

    /* last prefer removing enemy hands(golden) */
    const goldenHandsAmount = defenderPlayer.dicesHandler.dicesList.filter(
      (die) => die?.mesh?.userData?.upwardSymbol && die?.mesh?.userData?.isGoldenSymbol,
    ).length
    if (goldenHandsAmount > 0) {
      ;[...Array(goldenHandsAmount).keys()].forEach(() => {
        toRemoveDices.push('HAND')
      })
    }

    /* first remove golden, then normal */
    let dicesToRemove = []
    defenderPlayer.dicesHandler.dicesList
      .filter((die) => {
        const symbol = die?.mesh?.userData?.upwardSymbol
        const isGolden = die?.mesh?.userData?.isGoldenSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0 && isGolden) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })
      .filter((die) => {
        const symbol = die?.mesh?.userData?.upwardSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })
      .filter((die) => {
        toRemoveDices.push('HAND')
        const symbol = die?.mesh?.userData?.upwardSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })

    /* to ensure there are enough selections we append the random selection at the
     * beginning and slice for the required amount */
    const totalToRemove = dicesToRemove
      .concat(defenderPlayer.dicesHandler.dicesList.filter((die, index) => dicesToRemoveList.includes(index)))
      .concat(defenderPlayer.dicesHandler.dicesList)
      .slice(0, diceToSelectAmount)

    /* then we toggle the marked-for-removal dices and let them move back to user dices stash */
    const markedDicesPromises = defenderPlayer.dicesHandler.dicesList.map((die, index) => {
      if (totalToRemove.some((dice) => dice?.mesh.name === die?.mesh.name)) {
        die.toggleMarkForRemoval()
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          if (die.isMarkedForRemoval) {
            this.world.diceResolver.moveDieBackToStart(die, defenderPlayer)
            die.toggleDice(false, false)
          }

          resolve()
        }, 1500)
      })
    })
    return await Promise.all(markedDicesPromises)
  }

  async selectEnemyDicesToSteal(diceToSelectAmount) {
    const defenderPlayer = this.world.getSessionPlayer()
    const dicesToRemoveList = [...Array(defenderPlayer.dicesHandler.dicesList.length).keys()]
      .sort((a, b) => 0.5 - Math.random())
      .slice(0, diceToSelectAmount)

    const attackerDices = {
      AXE: 0,
      ARROW: 0,
      HELM: 0,
      SHIELD: 0,
      HAND: 0,
    }
    const defenderDices = {
      AXE: 0,
      ARROW: 0,
      HELM: 0,
      SHIELD: 0,
      HAND: 0,
    }
    defenderPlayer.dicesHandler.dicesList.forEach((die) => {
      const symbol = die?.mesh?.userData?.upwardSymbol
      defenderDices[symbol] = defenderDices[symbol]++
    })
    this.dicesHandler.dicesList.forEach((die) => {
      const symbol = die?.mesh?.userData?.upwardSymbol
      attackerDices[symbol] = attackerDices[symbol]++
    })

    let toRemoveDices = []
    /* first prefer golden axes if enemy got more axes than you got helms */
    if (attackerDices['HELM'] < defenderDices['AXE']) {
      const times = defenderDices['AXE'] - attackerDices['HELM']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('AXE')
      })
    }
    /* */
    if (attackerDices['AXE'] >= defenderDices['HELM'] && defenderDices['AXE'] > 0) {
      const times = defenderDices['AXE']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('AXE')
      })
    }
    if (attackerDices['ARROW'] >= defenderDices['SHIELD'] && defenderDices['ARROW'] > 0) {
      const times = defenderDices['ARROW']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('ARROW')
      })
    }
    /* second prefer golden arrows if enemy got more axes than you got shield */
    if (attackerDices['SHIELD'] < defenderDices['ARROW']) {
      const times = defenderDices['ARROW'] - attackerDices['SHIELD']
      ;[...Array(times).keys()].forEach(() => {
        toRemoveDices.push('ARROW')
      })
    }
    /* third prefer removing enemy shields(golden) if you got arrows */
    if (defenderDices['SHIELD'] > 0 && attackerDices['ARROW'] > 0) {
      ;[...Array(defenderDices['SHIELD']).keys()].forEach(() => {
        toRemoveDices.push('SHIELD')
      })
    }
    toRemoveDices.push('ARROW')
    toRemoveDices.push('AXE')
    toRemoveDices.push('HAND')

    /* last prefer removing enemy hands(golden) */
    const goldenHandsAmount = defenderPlayer.dicesHandler.dicesList.filter(
      (die) => die?.mesh?.userData?.upwardSymbol && die?.mesh?.userData?.isGoldenSymbol,
    ).length
    if (goldenHandsAmount > 0) {
      ;[...Array(goldenHandsAmount).keys()].forEach(() => {
        toRemoveDices.push('HAND')
      })
    }

    /* first remove golden, then normal */
    let dicesToRemove = []
    defenderPlayer.dicesHandler.dicesList
      .filter((die) => {
        const symbol = die?.mesh?.userData?.upwardSymbol
        const isGolden = die?.mesh?.userData?.isGoldenSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0 && isGolden) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })
      .filter((die) => {
        const symbol = die?.mesh?.userData?.upwardSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })
      .filter((die) => {
        toRemoveDices.push('HAND')
        const symbol = die?.mesh?.userData?.upwardSymbol
        const foundIndex = toRemoveDices.findIndex((sym) => sym === symbol)
        if (foundIndex >= 0) {
          toRemoveDices.splice(foundIndex, 1)
          dicesToRemove.push(die)
          return false
        }
        return true
      })

    /* to ensure there are enough selections we append the random selection at the
     * beginning and slice for the required amount */
    const totalToConvert = dicesToRemove
      .concat(defenderPlayer.dicesHandler.dicesList.filter((die, index) => dicesToRemoveList.includes(index)))
      .concat(defenderPlayer.dicesHandler.dicesList)
      .slice(0, diceToSelectAmount)

    /* then we toggle the marked-for-removal dice and let them move enemies front line */
    const markedDicesPromises = defenderPlayer.dicesHandler.dicesList.map((die, index) => {
      if (totalToConvert.some((dice) => dice?.mesh.name === die?.mesh.name)) {
        die.toggleMarkForSteal()
        die.moveForward()
        die.changeDieOwner(this.player)
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 1500)
      })
    })

    defenderPlayer.dicesHandler.removeStolenDices()

    /* only move dice to enemy after all owners were adjusted */
    await new Promise((resolve) => {
      this.dicesHandler.moveSelectedDicesToEnemy()
      setTimeout(() => {
        resolve()
      }, 4500)
    })

    return await Promise.all(markedDicesPromises)
  }
}
