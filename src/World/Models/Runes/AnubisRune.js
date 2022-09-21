import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class AnubisRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_ANUBIS, player)
  }

  async beforeResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        resolve()
      }, 800)
    })
  }

  async afterResolution() {
    return this.resolution((resolve, tier) => {
      setTimeout(async () => {
        resolve()
      }, 800)
    })
  }
}
