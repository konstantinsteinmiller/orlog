import * as gui from 'lil-gui'
import Stats from 'stats.js'

export default class Debug {
  constructor() {
    this.experience = experience
    this.isActive = window.location.hash === '#debug'

    if (this.isActive) {
      // STATS
      this.stats = new Stats()
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
      this.stats.begin()

      this.ui = new gui.GUI()

      window.onkeydown = (event) => {
        if (event.key === 'h') {
          this.ui._hidden ? this.ui.show() : this.ui.hide()
        }
        if (event.key === 'c') {
          this.ui._closed ? this.ui.open() : this.ui.close()
        }
      }
    }
  }
}
