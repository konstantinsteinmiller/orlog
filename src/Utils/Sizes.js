import EventEmitter from '@/Utils/EventEmitter.js'

export default class Sizes extends EventEmitter {
  constructor() {
    super()
    this.canvas = experience.canvas

    // Setup
    this.width = this.canvas.clientWidth
    this.height = this.canvas.clientHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Resize event
    window.addEventListener('resize', () => {
      this.width = this.canvas.clientWidth
      this.height = this.canvas.clientHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)

      this.trigger('resize')
    })
  }
}
