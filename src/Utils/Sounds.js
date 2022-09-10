import { getStorage, setStorage } from '@/Utils/storage.js'
import { GAME_SOUND_EFFECT_VOLUME } from '@/Utils/constants.js'

export default class Sounds {
  constructor() {
    this.experience = experience
    this.resources = experience.resources
    this.hitSound = null
    this.diceShakeSound = null
    this.diceHitSounds = []
    // create an audio context
    this.audioCtx = new AudioContext()
    this.audioListener = new THREE.AudioListener()
    this.diceHit1Sound = new THREE.Audio(this.audioListener)
    experience.scene.add(this.diceHit1Sound)

    this.setSoundEffectVolume()

    // Wait for resources
    this.resources.on('ready', () => {
      this.hitSound = experience.resources.items.hitSound
      this.diceShakeSound = experience.resources.items.diceShake
      this.diceHitSounds = [
        experience.resources.items.diceHit1,
        experience.resources.items.diceHit2,
        experience.resources.items.diceHit3,
      ]
    })
  }

  async playSound(sounds, randomVolume = false, randomVolumeOffset = 0.2, maxVolume = 1) {
    // const resp = await fetch('https://upload.wikimedia.org/wikipedia/commons/6/68/Crash.ogg')
    // const arrayBuffer = await resp.arrayBuffer()
    const soundName =
      sounds instanceof Array
        ? sounds[Math.max(Math.floor(Math.random() * sounds.length), sounds.length - 1)]
        : sounds

    // const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer)
    const audioBuffer = experience.resources.items?.[soundName]
    const source = this.audioCtx.createBufferSource()
    source.buffer = audioBuffer

    if (randomVolume) {
      var gainNode = this.audioCtx.createGain()
      gainNode.gain.value = (Math.random() * maxVolume + randomVolumeOffset) * this.soundEffectsVolume
      gainNode.connect(this.audioCtx.destination)

      // now instead of connecting to aCtx.destination, connect to the gainNode
      source.connect(gainNode)
    } else {
      source.connect(this.audioCtx.destination)
    }

    // start playback
    source.start()

    /* pause audio for ui menus or settings */
    /*setTimeout(() => {
      this.audioCtx.suspend()
      alert()
      setTimeout(() => this.audioCtx.resume(), 100)
    }, 200)*/
  }

  playHitSound(collision) {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if (this.hitSound && impactStrength > 1.5) {
      this.hitSound.volume = Math.random() * this.soundEffectsVolume
      this.hitSound.currentTime = 0
      try {
        this.hitSound.play()
      } catch (e) {}
    }
  }

  playDiceShakeSound() {
    // this.playSound('diceShake', true)
    if (this.diceShakeSound) {
      this.diceShakeSound.volume = (Math.random() * 0.5 + 0.5) * this.soundEffectsVolume
      this.diceShakeSound.currentTime = 0
      try {
        this.diceShakeSound.play()
      } catch (e) {}
    }
  }

  playDiceHitSound() {
    // if (this.diceHitSounds) {
    //   const randSound = Math.max(Math.floor(Math.random() * 3), 2)
    //   const soundInstance = JSON.parse(JSON.stringify(this.diceHitSounds[randSound]))
    //   soundInstance.volume = Math.random() * 0.7
    //   soundInstance.currentTime = 0
    //   try {
    //     soundInstance.play()
    //   } catch (e) {}
    // }
  }

  setSoundEffectVolume() {
    this.soundEffectsVolume = parseFloat(getStorage(GAME_SOUND_EFFECT_VOLUME, true)) ?? 1.0
  }
}
