export default class Input {
  constructor() {
    this.x = 0
    this.y = 0
    this.cursor = {
      x: 0,
      y: 0,
    }
    this.sizes = experience.sizes
    this.canvas = experience.canvas

    window.onmousemove = (event) => {
      this.cursor.x = event.clientX / this.canvas.clientWidth - 0.5 /* * 2*/
      this.cursor.y = event.clientY / this.canvas.clientHeight - 0.5 /* * 2*/
      this.x = (event.clientX / this.canvas.clientWidth - 0.5) * 2
      this.y = -(event.clientY / this.canvas.clientHeight - 0.5) * 2
    }
  }
  update() {}
  draw(context) {}
}
