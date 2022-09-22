import Experience from '@/Experience.js'
import FaithToken, { targetFaithTokenPosition } from '@/World/Models/FaithToken.js'
import { getStorage } from '@/Utils/storage.js'
import { GAME_PLAYER_ID, GAME_SYMBOLS } from '@/Utils/constants.js'
import { gsap as g } from 'gsap'

export default class DiceResolver {
  constructor() {
    // super();

    this.experience = new Experience()
    this.world = this.experience.world
    this.sounds = this.experience.sounds
    this.scene = this.experience.scene
  }

  setAllDicesList() {
    this.startingPlayer = this.world.getStartingPlayer()
    this.secondTurnPlayer = this.world.getStartingPlayer(true)

    this.allDicesList = this.startingPlayer.dicesHandler.dicesList
      .filter(() => (die) => !die.isMarkedForRemoval)
      .concat(this.secondTurnPlayer.dicesHandler.dicesList.filter(() => (die) => !die.isMarkedForRemoval))
  }

  async createFaithTokens() {
    const goldenDicesList = this.allDicesList.filter(
      (die) => die.mesh.userData?.isGoldenSymbol && !die.isMarkedForRemoval,
    )

    const faithPromiseList = goldenDicesList.map((dice) => {
      const diceOwner = this.world.players[dice.mesh.userData?.playerId]
      const isPlayer = getStorage(GAME_PLAYER_ID, true) === diceOwner.playerId

      const fromPosition = new THREE.Vector3(
        dice.group.position.x,
        dice.group.position.y + 0.2,
        dice.group.position.z,
      )
      return new Promise((resolve) => {
        diceOwner.faithTokens.push(
          new FaithToken(isPlayer, diceOwner.faithTokens.length, 0, fromPosition, resolve),
        )
      })
    })
    await Promise.all(faithPromiseList)

    this.resolveSymbols()
  }

  async resolveSymbols() {
    // const starting ax
    const startingAxesDices = []
    const startingArrowsDices = []
    const startingHelmsDices = []
    const startingShieldsDices = []
    const startingHandsDices = []
    const secondAxesDices = []
    const secondArrowsDices = []
    const secondHelmsDices = []
    const secondShieldsDices = []
    const secondHandsDices = []

    this.startingPlayer.dicesHandler.dicesList.forEach((die) => {
      if (die.isMarkedForRemoval) {
        return
      }
      const upwardSymbol = die.mesh.userData.upwardSymbol
      upwardSymbol === GAME_SYMBOLS.AXE && startingAxesDices.push(die)
      upwardSymbol === GAME_SYMBOLS.ARROW && startingArrowsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.HELM && startingHelmsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.SHIELD && startingShieldsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.HAND && startingHandsDices.push(die)
    })

    this.secondTurnPlayer.dicesHandler.dicesList.forEach((die) => {
      if (die.isMarkedForRemoval) {
        return
      }
      const upwardSymbol = die.mesh.userData.upwardSymbol
      upwardSymbol === GAME_SYMBOLS.AXE && secondAxesDices.push(die)
      upwardSymbol === GAME_SYMBOLS.ARROW && secondArrowsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.HELM && secondHelmsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.SHIELD && secondShieldsDices.push(die)
      upwardSymbol === GAME_SYMBOLS.HAND && secondHandsDices.push(die)
    })

    /* resolve axes of attacker */
    await this.resolveDiceSymbols(
      startingAxesDices,
      secondHelmsDices,
      this.startingPlayer,
      this.secondTurnPlayer,
    )

    /* resolve arrows of attacker */
    await this.resolveDiceSymbols(
      startingArrowsDices,
      secondShieldsDices,
      this.startingPlayer,
      this.secondTurnPlayer,
    )

    /* resolve axes of defender */
    await this.resolveDiceSymbols(
      secondAxesDices,
      startingHelmsDices,
      this.secondTurnPlayer,
      this.startingPlayer,
    )

    /* resolve arrows of defender */
    await this.resolveDiceSymbols(
      secondArrowsDices,
      startingShieldsDices,
      this.secondTurnPlayer,
      this.startingPlayer,
    )

    /* resolve hands for attacker */
    await this.resolveDiceSymbols(
      startingHandsDices,
      secondHandsDices,
      this.startingPlayer,
      this.secondTurnPlayer,
      true,
    )

    /* resolve hands for defender */
    await this.resolveDiceSymbols(
      secondHandsDices,
      startingHandsDices,
      this.secondTurnPlayer,
      this.startingPlayer,
      true,
    )

    await new Promise((resolve) => {
      setTimeout(async () => {
        await this.world.runeResolver.resolveRunesAfterDiceResolution()
        resolve()
      }, 1000)
    })
  }

  resolveDiceSymbols(attackerDices, defenderDices, attackerPlayer, defenderPlayer, isHands) {
    let damageAmount = 0

    attackerDices = attackerDices.filter((die) => !die.isMarkedForRemoval)
    return new Promise((resolve) => {
      if (!attackerDices.length) {
        !isHands &&
          defenderDices.forEach((die) => {
            this.moveDieBackToStart(die, defenderPlayer)
          })
        return resolve()
      } else {
        /* resolve attack dices and destroy dices or destroy life stones */
        !isHands &&
          attackerDices.forEach((dice, index) => {
            const defenderDie = defenderDices.shift()
            if (defenderDie) {
              return g
                .to(dice.group.position, {
                  x: defenderDie.group.position.x,
                  y: defenderDie.group.position.y,
                  z:
                    defenderDie.group.position.z -
                    dice.scale * 2 * defenderPlayer.dicesHandler.offsetDirection,
                  duration: 0.7,
                  delay: 0.8 + index * 0.3,
                })
                .then(() => {
                  dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE && this.sounds.playSound('axeHitMetal')
                  dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW &&
                    this.sounds.playSound('arrowHitTargetAndWobble')

                  this.moveDieBackToStart(defenderDie, defenderPlayer)
                  this.moveDieBackToStart(dice, attackerPlayer)
                  if (index === attackerDices.length - 1) {
                    defenderDices.forEach((die) => {
                      this.moveDieBackToStart(die, defenderPlayer)
                    })
                    return resolve()
                  }
                })
            } else {
              const lifeStones = defenderPlayer.lifeStones
              const lifeStoneIndex = lifeStones.length - 1 - damageAmount

              if (lifeStoneIndex >= 0) {
                const lifeStone = lifeStones[lifeStoneIndex]
                damageAmount++
                return g
                  .to(dice.group.position, {
                    x: lifeStone.mesh.position.x,
                    y: lifeStone.mesh.position.y + dice.scale,
                    z:
                      lifeStone.mesh.position.z -
                      dice.scale * 1.5 * defenderPlayer.dicesHandler.offsetDirection,
                    duration: 1.5,
                    delay: 0.8 + index * 0.3,
                  })
                  .then(() => {
                    dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.AXE &&
                      this.sounds.playSound('axeHitStoneBreak')
                    dice.mesh.userData.upwardSymbol === GAME_SYMBOLS.ARROW &&
                      this.sounds.playSound('arrowIntoStone')

                    /* add collision sound with lifeStone here */
                    lifeStone.destroyLifeStone()
                    this.moveDieBackToStart(dice, attackerPlayer)
                    if (index === attackerDices.length - 1) {
                      defenderDices.forEach((die) => {
                        this.moveDieBackToStart(die, defenderPlayer)
                      })
                      return resolve()
                    }
                  })
              } else {
                defenderDices.forEach((die) => {
                  this.moveDieBackToStart(die, defenderPlayer)
                })
                return resolve()
              }
            }
          })

        /* resolve hand dices and steal faith tokens */
        let faithTokensStolen = 0
        isHands &&
          attackerDices.forEach((dice, index) => {
            const faithTokens = defenderPlayer.faithTokens
            const faithTokensIndex = faithTokens.length - 1 - faithTokensStolen
            const defenderFaithToken = faithTokens[faithTokensIndex]

            const attackerFaithTokens = attackerPlayer.faithTokens
            const attackerFaithTokensIndex = attackerFaithTokens.length + faithTokensStolen

            if (faithTokensIndex >= 0) {
              faithTokensStolen++

              return g
                .to(dice.group.position, {
                  x: defenderFaithToken.mesh.position.x,
                  y: defenderFaithToken.mesh.position.y + dice.scale * 2.3,
                  z: defenderFaithToken.mesh.position.z,
                  duration: 1.0,
                  delay: 0.8 + index * 1.5,
                })
                .then(() => {
                  /* move faithToken up under the dice */
                  g.to(defenderFaithToken.mesh.position, {
                    x: defenderFaithToken.mesh.position.x,
                    y: defenderFaithToken.mesh.position.y + dice.scale,
                    z: defenderFaithToken.mesh.position.z,
                    duration: 0.5,
                  })

                  g.to(dice.group.position, {
                    x: defenderFaithToken.mesh.position.x,
                    y: defenderFaithToken.mesh.position.y + dice.scale * 2.5,
                    z: defenderFaithToken.mesh.position.z,
                    duration: 0.5,
                  }).then(() => {
                    /* move faithToken with the dice to own stack */
                    const attackerFaithTokenPosition = targetFaithTokenPosition(
                      attackerFaithTokensIndex,
                      attackerPlayer.dicesHandler.offsetDirection,
                      attackerPlayer.dicesHandler.midZOffset,
                    )

                    g.to(defenderFaithToken.mesh.position, {
                      x: attackerFaithTokenPosition.x,
                      y: attackerFaithTokenPosition.y + dice.scale,
                      z: attackerFaithTokenPosition.z,
                      duration: 0.8,
                    })

                    g.to(dice.group.position, {
                      x: attackerFaithTokenPosition.x,
                      y: attackerFaithTokenPosition.y + dice.scale * 2.5,
                      z: attackerFaithTokenPosition.z,
                      duration: 0.8,
                    }).then(() => {
                      /* this faithToken will be added to attackerPlayer stack */
                      const faithToken = defenderPlayer.faithTokens.pop()
                      defenderFaithToken.setOwner(attackerPlayer, attackerFaithTokensIndex)
                      attackerPlayer.faithTokens.push(defenderFaithToken)

                      defenderFaithToken.moveFaithTokenToStack()
                      /* add hand steal sound here */
                      this.moveDieBackToStart(dice, attackerPlayer)
                      if (index === attackerDices.length - 1) {
                        return resolve()
                      }
                    })
                  })
                })
            } else {
              this.moveDieBackToStart(dice, attackerPlayer)
              return resolve()
            }
          })
      }
    })
  }

  moveDieBackToStart(die, ownerPlayer) {
    setTimeout(() => {
      g.to(die.group.position, {
        y: 2,
        duration: 0.3,
      }).then(() => {
        g.to(die.group.position, {
          x: ownerPlayer.dicesHandler.offsetDirection * (die.modelNumber * 0.7 + 2.5),
          y: 2,
          z: ownerPlayer.dicesHandler.offsetDirection * (ownerPlayer.dicesHandler.midZOffset + 3),
          duration: 0.5,
        }).then(() => {
          g.to(die.group.position, {
            x: ownerPlayer.dicesHandler.offsetDirection * (die.modelNumber * 0.7 + 2.5),
            y: die.scale,
            z: ownerPlayer.dicesHandler.offsetDirection * (ownerPlayer.dicesHandler.midZOffset + 3),
            duration: 0.2,
          })
        })
      })
    }, 500)
  }
}
