import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class SobekRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_SOBEK, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      const enemyPlayer = this.world.getEnemyPlayer(this.owner.playerId)
      setTimeout(async () => {
        this.experience.sounds.playSound('knifeStab')

        const maxLifeStones = this.owner.lifeStones.length
        const sacrificeAmount = Math.min(tier.value, maxLifeStones)
        const damageAmount = sacrificeAmount * 2
        await this.owner.destroyLifeStones(sacrificeAmount)
        await enemyPlayer.destroyLifeStones(damageAmount)

        resolve()
      }, 800)
    })
  }
}
