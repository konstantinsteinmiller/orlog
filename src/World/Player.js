import DicesHandler from '@/World/DicesHandler.js'
import Bowl from '@/World/Models/Bowl.js'
import LifeStone from '@/World/Models/LifeStone.js'
import FaithToken from '@/World/Models/FaithToken.js'
import Experience from '@/Experience.js'

export default class Player {
  constructor(playerId, isPlayer) {
    this.experience = new Experience()
    this.debug = this.experience.debug

    this.playerId = playerId
    this.isPlayer = !!isPlayer
    this.lifeStones = []
    this.faithTokens = []

    this.init()

    // Debug
    if (this.debug.isActive && !this.isPlayer) {
      this.debugFolder = this.debug.ui.addFolder('world')
      this.debugFolder
        .addColor(this.lifeStones[0].highlightMesh.material, 'color')
        .name('color of the lifeStone highlight')
        .onChange((color) => {
          this.lifeStones.forEach((stone) => {
            stone.highlightMesh.material.color = color
          })
        })
      this.debug.faithTokenAmount = 3
      this.debug.lifeStoneAmount = 2
      this.debugFolder.add(this, 'destroyLifeStones')
      this.debugFolder.add(this.debug, 'lifeStoneAmount', 1, 20, 1)
      this.debugFolder.add(this, 'destroyFaithTokens')
      this.debugFolder.add(this.debug, 'faithTokenAmount', 1, 20, 1)
    }

    setTimeout(() => {
      this.destroyLifeStones(3)
    }, 2500)

    setTimeout(() => {
      this.destroyFaithTokens(3)
    }, 5700)
  }

  init() {
    this.dicesHandler = new DicesHandler(this.playerId, this.isPlayer)
    new Bowl(this.isPlayer)
    this.lifeStones = [...Array(15).keys()].map((id) => new LifeStone(this.isPlayer, id, id * 0.1))
    this.faithTokens = [...Array(13).keys()].map((id) => new FaithToken(this.isPlayer, id, id * 0.2))
  }

  destroyLifeStones(amount) {
    ;[...Array(amount || this.debug.lifeStoneAmount).keys()].forEach((stone, index) => {
      let lifeStone = this.lifeStones.pop()
      lifeStone?.destroyLifeStone(1000 + 200 * index)
      lifeStone = null
    })
  }

  destroyFaithTokens(amount) {
    ;[...Array(amount || this.debug.faithTokenAmount).keys()].forEach((token, index) => {
      let faithToken = this.faithTokens.pop()
      faithToken?.destroyFaithToken(200 * index)
      faithToken = null
    })
  }

  update() {
    this.dicesHandler && this.dicesHandler.update()
  }
}
