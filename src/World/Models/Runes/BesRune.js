import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class BesRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_BES, player)
  }

  async beforeResolution() {
    return this.resolution((resolve, tier) => {
      const enemyPlayer = this.world.getEnemyPlayer(this.owner.playerId)
      setTimeout(async () => {
        this.experience.sounds.playSound('repel')
        if (enemyPlayer.selectedRune && +enemyPlayer.selectedRune.tier.substring(4, 5) <= tier.value) {
          await enemyPlayer.selectedRune.rune.setRuneBadHighlight()
          enemyPlayer.selectedRune = null
          resolve()
        } else {
          this.experience.sounds.playSound('fail')
          resolve()
        }
      }, 800)
    })
  }

  async afterResolution() {
    return Promise.resolve()
  }
}
