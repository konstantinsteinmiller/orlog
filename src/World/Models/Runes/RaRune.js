import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class RaRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_RA, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        if (this.owner.roundBlockedDices > 0) {
          this.experience.sounds.playSound('fountain')
          const healAmount = this.owner.roundBlockedDices * tier.value
          await this.owner.addLifeStones(healAmount)
        } else {
          this.experience.sounds.playSound('fail')
        }
        resolve()
      }, 1500)
    })
  }
}
