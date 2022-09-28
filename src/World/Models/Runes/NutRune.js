import { GAME_SYMBOLS, GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class GebRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_NUT, player)
  }

  async beforeResolution() {
    return this.resolution((resolve, tier) => {
      const enemyPlayer = this.world.getEnemyPlayer(this.owner.playerId)
      setTimeout(async () => {
        /* check if enemy has at least one shield */
        if (
          enemyPlayer.dicesHandler.dicesList.filter(
            (die) => die.mesh.userData.upwardSymbol === GAME_SYMBOLS.SHIELD,
          ).length > 0
        ) {
          this.experience.sounds.playSound('breakWood')
          await enemyPlayer.dicesHandler.removeDice(GAME_SYMBOLS.SHIELD, tier.value)
        } else {
          this.experience.sounds.playSound('fail')
        }

        resolve()
      }, 1500)
    })
  }

  async afterResolution() {
    return Promise.resolve()
  }
}
