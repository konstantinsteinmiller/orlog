import Experience from '@/Experience.js'
import FaithToken from '@/World/Models/FaithToken.js'
import { getStorage } from '@/Utils/storage.js'
import { GAME_PLAYER_ID, GAME_SYMBOLS } from '@/Utils/constants.js'
import { gsap as g } from 'gsap'

export default class DiceResolver {
  constructor() {
    // super();

    this.experience = new Experience()
    this.world = this.experience.world
    this.scene = this.experience.scene
    this.startingPlayer = this.world.getPlayers()[0]
    this.secondTurnPlayer = this.world.getPlayers()[1]

    this.allDicesList = this.startingPlayer.dicesHandler.dicesList.concat(
      this.secondTurnPlayer.dicesHandler.dicesList,
    )
    console.log(
      'this.allDicesList: ',
      this.allDicesList.map((dice) => dice.mesh.userData?.upwardSymbol),
    )

    setTimeout(() => {
      this.createFaithTokens()
    }, 2000)
  }

  createFaithTokens() {
    const goldenDicesList = this.allDicesList.filter((dice) => dice.mesh.userData?.isGoldenSymbol)

    goldenDicesList.forEach((dice) => {
      const diceOwner = this.world.players[dice.mesh.userData?.playerId]
      const isPlayer = getStorage(GAME_PLAYER_ID, true) === diceOwner.playerId

      const fromPosition = new THREE.Vector3(
        dice.group.position.x,
        dice.group.position.y + 0.2,
        dice.group.position.z,
      )
      diceOwner.faithTokens.push(new FaithToken(isPlayer, diceOwner.faithTokens.length, 0, fromPosition))
    })

    setTimeout(() => {
      this.resolveSymbols()
    }, 3500)
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

    this.startingPlayer.dicesHandler.dicesList.forEach((dice) => {
      const upwardSymbol = dice.mesh.userData.upwardSymbol
      upwardSymbol === GAME_SYMBOLS.AXE && startingAxesDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.ARROW && startingArrowsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.HELM && startingHelmsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.SHIELD && startingShieldsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.HAND && startingHandsDices.push(dice)
    })

    this.secondTurnPlayer.dicesHandler.dicesList.forEach((dice) => {
      const upwardSymbol = dice.mesh.userData.upwardSymbol
      upwardSymbol === GAME_SYMBOLS.AXE && secondAxesDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.ARROW && secondArrowsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.HELM && secondHelmsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.SHIELD && secondShieldsDices.push(dice)
      upwardSymbol === GAME_SYMBOLS.HAND && secondHandsDices.push(dice)
    })

    await this.resolveAttackingSymbols(
      startingAxesDices,
      secondHelmsDices,
      this.startingPlayer,
      this.secondTurnPlayer,
    )
    /* clean non attacked helmets */

    await this.resolveAttackingSymbols(
      startingArrowsDices,
      secondShieldsDices,
      this.startingPlayer,
      this.secondTurnPlayer,
    )
    /* clean non attacked shields */

    await this.resolveAttackingSymbols(
      secondAxesDices,
      startingHelmsDices,
      this.secondTurnPlayer,
      this.startingPlayer,
    )
    /* clean non attacked helmets */

    await this.resolveAttackingSymbols(
      secondArrowsDices,
      startingShieldsDices,
      this.secondTurnPlayer,
      this.startingPlayer,
    )
    /* clean non attacked shields */

    /* resolve hands */
  }

  resolveAttackingSymbols(attackerDices, defenderDices, attackerPlayer, defenderPlayer) {
    let damageAmount = 0
    return new Promise((resolve) => {
      if (!attackerDices.length) {
        return resolve()
      } else {
        /* give the player some time to see what happens */
        setTimeout(() => {
          attackerDices.forEach((dice, index) => {
            const defenderDie = defenderDices.shift()
            if (defenderDie) {
              g.to(defenderDie.group.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.5,
                delay: 0.7 + index * 0.3,
              })
              g.to(dice.group.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.5,
                delay: 0.8 + index * 0.3,
              })
              return g
                .to(dice.group.position, {
                  x: defenderDie.group.position.x,
                  y: defenderDie.group.position.y,
                  z:
                    defenderDie.group.position.z -
                    dice.scale * 2 * defenderPlayer.dicesHandler.offsetDirection,
                  duration: 0.7,
                  delay: index * 0.3,
                })
                .then(() => {
                  /* add collision sound here */
                  this.moveDieBackToStart(defenderDie, defenderPlayer)
                  this.moveDieBackToStart(dice, attackerPlayer)
                  if (index === attackerDices.length - 1) {
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
                    x: lifeStone.position.x,
                    y: lifeStone.position.y + dice.scale,
                    z: lifeStone.position.z - dice.scale * 1.5 * defenderPlayer.dicesHandler.offsetDirection,
                    duration: 1.5,
                    delay: index * 0.3,
                  })
                  .then(() => {
                    /* add collision sound here */
                    lifeStone.destroyLifeStone()
                    this.moveDieBackToStart(dice, attackerPlayer)
                    if (index === attackerDices.length - 1) {
                      return resolve()
                    }
                  })
              } else {
                return resolve()
              }
            }
          })
        }, 800)
      }
    })
  }

  moveDieBackToStart(die, ownerPlayer) {
    setTimeout(() => {
      g.to(die.group.scale, {
        x: die.scale,
        y: die.scale,
        z: die.scale,
        duration: 0.1,
      })
      g.to(die.group.position, {
        y: 2,
        duration: 0.3,
      }).then(() => {
        g.to(die.group.position, {
          x: die.modelNumber * 0.7 + 2.5,
          y: 2,
          z: ownerPlayer.dicesHandler.offsetDirection * (ownerPlayer.dicesHandler.midZOffset + 3),
          duration: 0.5,
        }).then(() => {
          g.to(die.group.position, {
            x: die.modelNumber * 0.7 + 2.5,
            y: die.scale,
            z: ownerPlayer.dicesHandler.offsetDirection * (ownerPlayer.dicesHandler.midZOffset + 3),
            duration: 0.2,
          })
        })
      })
    }, 500)
  }
}
