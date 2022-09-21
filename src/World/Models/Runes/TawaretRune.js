import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class TawaretRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_TAWARET, player)
  }

  async beforeResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        this.experience.sounds.playSound('fountain')
        await this.owner.addLifeStones(tier.value)
        resolve()
      }, 800)
    })
  }

  async afterResolution() {
    return Promise.resolve()
  }
}
