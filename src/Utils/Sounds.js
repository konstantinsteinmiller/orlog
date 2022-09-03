export default class Sounds {
  constructor() {
    this.experience = experience
    this.resources = experience.resources
    this.hitSound = null
    this.diceShakeSound = null
    this.diceHitSounds = []

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

  playHitSound(collision) {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    if (this.hitSound && impactStrength > 1.5) {
      this.hitSound.volume = Math.random()
      this.hitSound.currentTime = 0
      try {
        this.hitSound.play()
      } catch (e) {}
    }
  }

  playDiceShakeSound() {
    if (this.diceShakeSound) {
      this.diceShakeSound.volume = Math.random()
      this.diceShakeSound.currentTime = 0
      try {
        this.diceShakeSound.play()
      } catch (e) {}
    }
  }

  playDiceHitSound() {
    if (this.diceHitSounds) {
      this.diceHitSounds.volume = Math.random()
      this.diceHitSounds.currentTime = 0
      try {
        this.diceHitSounds.play()
      } catch (e) {}
    }
  }
}
