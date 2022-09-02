export default class Mouse {
  constructor() {
    this.x = 0
    this.y = 0
    this.cursor = {
      x: 0,
      y: 0,
    }
    window.onmousemove = (event) => {
      this.cursor.x = event.clientX / window.innerWidth - 0.5 /* * 2*/
      this.cursor.y = event.clientY / innerHeight - 0.5 /* * 2*/
      this.x = (event.clientX / window.innerWidth - 0.5) * 2
      this.y = -(event.clientY / innerHeight - 0.5) * 2
    }
  }
  update() {}
  draw(context) {}
}
