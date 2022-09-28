import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class HorusRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_HORUS, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      const enemyPlayer = this.world.getEnemyPlayer(this.owner.playerId)
      setTimeout(async () => {
        if (this.owner.roundUnblockedDices > 0) {
          this.experience.sounds.playSound('revengeMale')
          const additionalDamageAmount = Math.ceil(this.owner.roundUnblockedDices * tier.value)
          await enemyPlayer.destroyLifeStones(additionalDamageAmount)
        } else {
          this.experience.sounds.playSound('fail')
        }
        resolve()
      }, 800)
    })
  }
}
