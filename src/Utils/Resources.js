import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import EventEmitter from '@/Utils/EventEmitter.js'
import sources from '@/sources.js'
import { Texture, TextureLoader, CubeTextureLoader, AudioLoader } from 'three'
let instance = null

export default class Resources extends EventEmitter {
  constructor() {
    super()
    // Singleton
    if (instance) {
      setTimeout(() => {
        this.checkIfIsReady()
      })
      return instance
    }
    instance = this

    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0
    this.isReady = false

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.objLoader = new OBJLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
    this.loaders.textureLoader = new TextureLoader()
    this.loaders.cubeTextureLoader = new CubeTextureLoader()
    this.loaders.audioLoader = new AudioLoader()
  }

  startLoading() {
    // Load each source
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(
          source.path,
          (file) => {
            this.sourceLoaded(source, file)
          },
          () => {},
          (e) => {
            console.error('could not load: ', source.path)
          },
        )
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'objModel') {
        this.loaders.objLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'audioLoader') {
        this.loaders.audioLoader.load(source.path, (audioBuffer) => {
          this.sourceLoaded(source, audioBuffer)
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
    this.trigger('loaded-source', [this.loaded, this.toLoad, source.name])

    this.checkIfIsReady()
  }
  checkIfIsReady() {
    if (this.loaded === this.toLoad) {
      this.isReady = true
      this.trigger('ready')
    }
  }
}
