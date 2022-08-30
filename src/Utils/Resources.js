import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import EventEmitter from '@/Utils/EventEmitter.js'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'audio') {
        const audio = new Audio(source.path)
        audio.addEventListener(
          'canplaythrough',
          (event) => {
            this.sourceLoaded(source, event.path.pop())
          },
          false,
        )
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file

    this.loaded++

    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
