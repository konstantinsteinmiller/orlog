import EventEmitter from '@/Utils/EventEmitter.js'

export default class MainMenu extends EventEmitter {
  constructor() {
    super()
    this.menuWrapper = document.querySelector('.menu-wrapper')
    this.menu = document.querySelector('.menu-list')
    this.$startButton = document.querySelector('.menu-list-item:first-child')
    this.$joinButton = document.querySelector('.menu-list-item:nth-child(2)')
    this.items = document.querySelectorAll('.menu-list-item')
    this.w = document.querySelector('.ogame').clientWidth //window width
    this.h = document.querySelector('.ogame').clientHeight //window height
    this.offsetX = 0

    this.menuWrapper.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.$startButton.addEventListener('click', (e) => this.onStartClick(e))
    this.$joinButton.addEventListener('click', (e) => this.onJoinMultiplayerClick(e))
  }

  onMouseMove(e) {
    const offsetX = 0.5 - e.pageX / this.w //cursor position X
    const offsetY = 0.5 - e.pageY / this.h //cursor position Y
    const dy = e.pageY - this.h / 2 //@h/2 = center of poster
    const dx = e.pageX - this.w / 2 //@w/2 = center of poster
    const theta = Math.atan2(dy, dx) //angle between cursor and center of poster in RAD
    let angle = (theta * 180) / Math.PI - 90 //convert rad in degrees
    const offsetPoster = this.menu.dataset.offset
    const transformPoster = `translate(-50%, -50%) translate3d(0, ${-offsetX * offsetPoster}px, 0) rotateX(${
      -offsetY * offsetPoster
    }deg) rotateY(${offsetX * (offsetPoster * 2)}deg)` //poster transform

    //get angle between 0-360
    if (angle < 0) {
      angle = angle + 360
    }

    //poster transform
    this.menu.style.transform = transformPoster

    //parallax for each layer
    Array.prototype.forEach.call(this.items, (node) => {
      const offsetLayer = node.dataset.offset || 0
      const transformLayer = `translate3d(${offsetX * offsetLayer}px, ${offsetY * offsetLayer}px, 20px)`

      node.style.transform = transformLayer
      // node.css('transform', transformLayer)
    })
  }

  onStartClick() {
    this.trigger('start-game')
  }

  onJoinMultiplayerClick() {
    this.trigger('join-multiplayer-game')
  }
}
