import Experience from '@/Experience.js'

export default class RuneResolver {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.input = this.experience.input
    this.world = this.experience.world
    this.gui = this.world.gui
  }

  async resolveRunesBeforeDiceResolution() {
    const [startingPlayer, secondPlayer] = this.world.getPlayers()
    await startingPlayer?.selectedRune?.rune?.beforeResolution()
    await secondPlayer?.selectedRune?.rune?.beforeResolution()
    await new Promise((resolve) => {
      setTimeout(async () => {
        this.world.diceResolver.createFaithTokens()
        resolve()
      }, 2000)
    })
  }

  async resolveRunesAfterDiceResolution() {
    const [startingPlayer, secondPlayer] = this.world.getPlayers()
    await startingPlayer?.selectedRune?.rune?.afterResolution()
    await secondPlayer?.selectedRune?.rune?.afterResolution()
    console.log('----- DONE WITH ROUND ', this.world.round, '-----')
    this.world.finishRound()
  }
}
