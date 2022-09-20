import { GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class AnubisRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_ANUBIS, player)
  }

  async beforeResolution() {}

  async afterResolution() {
    // if (this.owner.selectedRune) {
    //   // const attackerPlayer = this.experience.world.getPlayerAtTurn()
    //   const defenderPlayer = this.experience.world.getPlayerAtTurn(false)
    //   const tier = this.rune[this.owner.selectedRune?.tier]
    //   this.payTierPrice()
    //   if (this.didPayTierPrice) {
    //     setTimeout(() => {
    //       /* maybe make vfx here to show life stones are beeing destroyed */
    //       defenderPlayer.destroyLifeStones(tier.value)
    //     }, 800)
    //     this.didPayTierPrice = false
    //   }
    // }
  }
}
