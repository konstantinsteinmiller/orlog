import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class BabiRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_BABI, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return new Promise((resolve) => {
      if (this.owner.selectedRune) {
        const enemyPlayer = this.experience.world.getEnemyPlayer(this.owner.playerId)
        const tier = this.rune[this.owner.selectedRune?.tier]
        this.payTierPrice()
        if (this.didPayTierPrice) {
          setTimeout(async () => {
            /* maybe make vfx here to show life stones are beeing destroyed */
            this.experience.sounds.playSound('thunder')
            await enemyPlayer.destroyLifeStones(tier.value)
            resolve()
          }, 800)
          this.didPayTierPrice = false
        } else {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }
}
