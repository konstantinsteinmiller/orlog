import EventEmitter from '@/Utils/EventEmitter.js'

export default class Time extends EventEmitter {
  constructor() {
    super()

    // Setup
    this.experience = window.experience
    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16
    this.clock = new THREE.Clock()
    this.clockDelta = 16

    window.requestAnimationFrame(() => {
      this.tick()
    })
  }

  tick() {
    const currentTime = Date.now()
    this.delta = currentTime - this.current
    this.current = currentTime
    this.elapsed = this.current - this.start

    this.clockDelta = this.clock.getDelta()

    this.trigger('tick')

    window.requestAnimationFrame(() => {
      this.tick()
    })

    if (this.experience.debug.isActive) {
      this.experience.debug.stats.end()
    }
  }
}
