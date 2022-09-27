import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class NephthysRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_NEPHTHYS, player)
  }

  async beforeResolution() {
    return Promise.resolve()
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        this.experience.sounds.playSound('faith')
        if (this.owner.roundDamageTaken > 0) {
          const faithTokensToAddAmount = Math.ceil(this.owner.roundDamageTaken * tier.value)
          await this.owner.addFaithTokens(faithTokensToAddAmount, this.mesh.position)
        }
        resolve()
      }, 800)
    })
  }
}
