export default class BabiRune extends Rune {
  constructor(props) {
    super(props)
  }

  beforeResolution() {}

  afterResolution() {
    if (this.owner.selectedRune) {
      // const attackerPlayer = this.experience.world.getPlayerAtTurn()
      const defenderPlayer = this.experience.world.getPlayerAtTurn(false)
      const tier = this.rune[this.owner.selectedRune?.tier]
      this.payTierPrice()
      if (this.didPayTierPrice) {
        setTimeout(() => {
          /* maybe make vfx here to show life stones are beeing destroyed */
          defenderPlayer.destroyLifeStones(tier.value)
        }, 800)
        this.didPayTierPrice = false
      }
    }
  }
}
