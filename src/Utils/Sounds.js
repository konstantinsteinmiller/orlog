export default class Sounds {
  constructor() {
    this.experience = experience
    this.resources = experience.resources
    this.hitSound = null

    // Wait for resources
    this.resources.on('ready', () => {
      this.hitSound = experience.resources.items.hitSound
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
}
