import * as gui from 'lil-gui'
import Stats from 'stats.js'

export default class Debug {
  constructor() {
    this.experience = experience
    this.isActive = window.location.hash === '#debug'
    this.isPhysicsDebugActive = true

    if (this.isActive) {
      // STATS
      this.stats = new Stats()
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
      this.stats.begin()

      this.ui = new gui.GUI()
      this.debugFolter = this.ui.addFolder('physics')
      this.debugFolter.add(this, 'togglePhysicsDebug').name('Toggle physics debug')

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

  togglePhysicsDebug() {
    this.physics = experience.physics
    if (this.isPhysicsDebugActive) {
      this.physics.debug.disable()
      experience.world.dicesHandler.dicesList.forEach((dice) => {
        dice.group.children[1].scale.set(new THREE.Vector3(0, 0, 0))
        dice.group.children[2].scale.set(new THREE.Vector3(0, 0, 0))
        dice.group.children[3].scale.set(new THREE.Vector3(0, 0, 0))
      })
    } else {
      this.physics.debug.enable()
    }
    this.isPhysicsDebugActive = !this.isPhysicsDebugActive
  }
}
