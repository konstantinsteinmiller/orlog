import Experience from '@/Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.instance = null // actual THREE Camera object

    this.setInstance()
    this.setControls()
  }

  setInstance() {
    const perspective = 800

    // this equation
    const fov = (180 * (2 * Math.atan(innerHeight / 2 / perspective))) / Math.PI
    // console.log('fov: ', fov)
    this.instance = new THREE.PerspectiveCamera(
      fov,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      100,
    )
    this.instance.position.set(0, 18, 5)
    // this.instance.position.set(0, 0, 5)
    this.scene.add(this.instance)
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
  }

  resizeRendererToDisplaySize() {
    this.renderer = this.experience.renderer
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    const width = (this.canvas.clientWidth * pixelRatio) | 0
    const height = (this.canvas.clientHeight * pixelRatio) | 0
    const needResize = this.canvas.width !== width || this.canvas.height !== height

    if (needResize) {
      this.renderer.instance.setSize(width, height, false)
    }
    return needResize
  }

  resize() {
    if (this.resizeRendererToDisplaySize()) {
      this.instance.aspect = this.canvas.clientWidth / this.canvas.clientHeight
      this.instance.updateProjectionMatrix()
    }
  }

  update() {
    this.controls.update()
  }
}
