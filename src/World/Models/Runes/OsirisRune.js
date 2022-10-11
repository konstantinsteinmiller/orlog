import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class OsirisRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_OSIRIS, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        if (this.owner.faithTokens.length > 0) {
          this.experience.sounds.playSound('fountain')
          const sacrificedFaithTokensAmount = Math.min(this.owner.faithTokens.length, tier.value)
          await this.owner.destroyFaithTokens(sacrificedFaithTokensAmount)
          await this.owner.addLifeStones(sacrificedFaithTokensAmount)
        } else {
          this.experience.sounds.playSound('fail')
        }
        resolve()
      }, 1500)
    })
  }
}
