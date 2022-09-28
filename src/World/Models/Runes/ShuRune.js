import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class ShuRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_SHU, player)
  }

  async beforeResolution() {
    return this.resolution((resolve, tier) => {
      const enemyPlayer = this.world.getEnemyPlayer(this.owner.playerId)
      setTimeout(async () => {
        this.experience.sounds.playSound('wind')
        await enemyPlayer.stealLifeStones(tier.value, this.owner)

        resolve()
      }, 1500)
    })
  }

  async afterResolution() {
    return Promise.resolve()
  }
}
