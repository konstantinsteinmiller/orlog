import * as dat from 'lil-gui'
import Stats from 'stats.js'

export default class Debug {
  constructor() {
    this.isActive = window.location.hash === '#debug'

    if (this.isActive) {
      // STATS
      this.stats = new Stats()
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
      this.stats.begin()

      this.ui = new dat.GUI()
    }
  }
}
