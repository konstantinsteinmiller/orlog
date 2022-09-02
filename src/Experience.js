// import * as THREE from 'three'
import Debug from '@/Utils/Debug.js'
import Sizes from '@/Utils/Sizes.js'
import Time from '@/Utils/Time.js'
import Sounds from '@/Utils/Sounds.js'
import Mouse from '@/Utils/Mouse.js'
import Resources from '@/Utils/Resources.js'
import Camera from '@/Camera.js'
import Renderer from '@/Renderer.js'
import World from '@/World/World.js'
import { AmmoPhysics } from '@enable3d/ammo-physics'
import { THREE } from 'enable3d/dist/index'

import sources from '@/sources.js'

let instance = null
window.PI = Math.PI

export default class Experience {
  constructor() {
    // Singleton
    if (instance) {
      return instance
    }
    instance = this

    // Global access
    window.experience = this
    window.THREE = THREE

    // Options
    this.canvas = webgl

    // Setup
    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.sounds = new Sounds()
    this.mouse = new Mouse()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()
    this.physics = new AmmoPhysics(this.scene)
    this.physics.debug.enable(true)

    // Resize event
    this.sizes.on('resize', () => {
      this.resize()
    })

    // Time tick event
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.physics.update(this.time.clockDelta * 1000)
    this.physics.updateDebugger()

    this.renderer.update()
  }

  destroy() {
    this.sizes.off('resize')
    this.time.off('tick')

    // Traverse the whole scene
    this.scene.traverse((child) => {
      // Test if it's a mesh
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // Loop through the material properties
        for (const key in child.material) {
          const value = child.material[key]

          // Test if there is a dispose function
          if (value && typeof value.dispose === 'function') {
            value.dispose()
          }
        }
      }
    })

    this.camera.controls.dispose()
    this.renderer.instance.dispose()

    if (this.debug.isActive) {
      this.debug.ui.destroy()
    }
  }
}
