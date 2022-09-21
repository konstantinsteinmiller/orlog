import { GAMES_RUNE_MODELS, GAME_RUNES_DESCRIPTIONS } from '@/Utils/constants.js'
import { gsap as g } from 'gsap'

export default class Rune {
  constructor(id, type, player) {
    this.experience = experience
    this.physics = experience.physics
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.isPlayer = player.isPlayer
    this.midZOffset = 5
    this.offsetDirection = this.isPlayer ? 1 : -1

    this.owner = player
    this.instance = this
    this.id = id
    this.model = GAMES_RUNE_MODELS[type]
    this.type = type
    this.scale = 2.5
    this.isHighlighted = false
    this.isSelected = false
    this.rune = GAME_RUNES_DESCRIPTIONS[this.type]
    this.didPayTierPrice = false

    const xPosition = 3.5 + this.id * 2.1
    const zPosition = this.midZOffset + 1

    this.position = new THREE.Vector3(this.offsetDirection * xPosition, 0, this.offsetDirection * zPosition)
    this.rotation = new THREE.Vector3(0, this.isPlayer ? 0 : Math.PI, 0)

    this.setMesh()
  }

  setMesh() {
    this.mesh = this.resources.items[this.model].scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.set(...this.rotation)
    this.mesh.name = `${this.type}`
    this.mesh.identifier = 'rune'
    this.highlightMesh = new THREE.Mesh(
      new THREE.BufferGeometry().copy(this.mesh.geometry),
      new THREE.MeshBasicMaterial({
        color: 0x7a7a00,
        transparent: true,
        opacity: 0,
      }),
    )
    const highlightScale = 1.1
    this.highlightMesh.scale.set(highlightScale, highlightScale, highlightScale)

    this.mesh.add(this.highlightMesh)
    this.scene.add(this.mesh)

    this.mesh.instance = this.instance
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  toggleRune(doHighLight = false, isSelected) {
    if (isSelected !== undefined) {
      this.isSelected = isSelected
    } else {
      this.isSelected = !this.isSelected
    }
    this.isHighlighted = doHighLight
    this.highlightMesh.material.opacity = isSelected ? 0.3 : this.isHighlighted ? 0.4 : 0
    this.highlightMesh.material.color.set(isSelected ? 0x00ff00 : 0x7a7a00)
  }

  payTierPrice() {
    const attackerPlayer = this.owner
    const tier = this.rune[this.owner.selectedRune?.tier]
    if (attackerPlayer.faithTokens.length >= +tier.cost.faith) {
      attackerPlayer.destroyFaithTokens(+tier.cost.faith)
      this.didPayTierPrice = true
      this.enlargeRuneHighlight()
    } else {
      this.experience.sounds.playSound('fail')
      this.toggleRune(this.isHighlighted, false)
    }
  }

  enlargeRuneHighlight() {
    g.to(this.highlightMesh.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
      duration: 0.7,
    }).then(() => {
      g.to(this.highlightMesh.scale, {
        x: 1.1,
        y: 1.1,
        z: 1.1,
        duration: 0.7,
      }).then(() => {
        this.toggleRune(this.isHighlighted, false)
      })
    })
  }

  async resolution(effectCallback = () => {}) {
    return new Promise(async (resolve) => {
      if (this.owner.selectedRune) {
        const tier = this.rune[this.owner.selectedRune?.tier]
        this.payTierPrice()
        if (this.didPayTierPrice) {
          await new Promise((resolveInner) => {
            effectCallback(resolveInner, tier)
          })
          this.owner.selectedRune = null
          this.didPayTierPrice = false
          resolve()
        } else {
          this.owner.selectedRune = null
          resolve()
        }
      } else {
        resolve()
      }
    })
  }
}
