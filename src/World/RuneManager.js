import Experience from '@/Experience.js'
import webGL from 'three/examples/jsm/capabilities/WebGL.js'
import Rune from '@/World/Models/Rune.js'
import { GAMES_RUNES } from '@/Utils/constants.js'

export default class RuneManager {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.input = this.experience.input
    this.camera = this.experience.camera.instance
    this.world = this.experience.world
    this.gui = this.world.gui

    this.rayCaster = new THREE.Raycaster()
    this.currentIntersect = null
    this.previousIntersect = null

    this.runes = [
      new Rune(0, GAMES_RUNES.RUNE_ANUBIS, this.isPlayer, this),
      new Rune(1, GAMES_RUNES.RUNE_BAST, this.isPlayer, this),
      new Rune(2, GAMES_RUNES.RUNE_HORUS, this.isPlayer, this),
      new Rune(3, GAMES_RUNES.RUNE_ISIS, this.isPlayer, this),
      new Rune(4, GAMES_RUNES.RUNE_SHU, this.isPlayer, this),
      new Rune(5, GAMES_RUNES.RUNE_SERQET, this.isPlayer, this),
      new Rune(6, GAMES_RUNES.RUNE_SETH, this.isPlayer, this),
      new Rune(7, GAMES_RUNES.RUNE_RA, this.isPlayer, this),
      new Rune(8, GAMES_RUNES.RUNE_OSIRIS, this.isPlayer, this),
      new Rune(9, GAMES_RUNES.RUNE_TAWARET, this.isPlayer, this),
      new Rune(10, GAMES_RUNES.RUNE_NEKHBET, this.isPlayer, this),
      // new Rune(11, GAMES_RUNES.RUNE_BABI, this.isPlayer, ownerPlayer),
    ]

    this.runesMeshes = Object.values(this.world.players).reduce(
      (runeMeshesList, player) => runeMeshesList.concat(player.runes.map((rune) => rune.mesh)),
      [],
    )

    this.input.on('click', () => this.toggleRuneSelection())
  }

  toggleRuneSelection() {
    if (this.world.isFaithCastingPhase && this.currentIntersect?.mesh?.identifier === 'rune') {
      if (!this.currentIntersect?.isPlayer) {
        this.debug.isActive && console.log('YOU cant activate enemies Runes')
        return
      }

      this.currentIntersect?.toggleRune(true, !this.currentIntersect?.isSelected)
      this.currentIntersect.owner.runes.forEach(
        (rune) => this.currentIntersect.type !== rune.type && rune.toggleRune(false, false),
      )
    }
  }

  handleRuneHover() {
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(this.runesMeshes)

    if (intersections.length) {
      this.currentIntersect =
        intersections[0].object?.parent?.instance?.mesh?.identifier === 'rune'
          ? intersections[0].object?.parent.instance
          : intersections[0].object

      if (
        this.previousIntersect?.type !== this.currentIntersect?.type &&
        this.currentIntersect?.mesh?.identifier === 'rune'
      ) {
        if (this.previousIntersect?.mesh?.identifier === 'rune') {
          this.previousIntersect?.toggleRune(false, this.previousIntersect?.isSelected)
        }
        this.previousIntersect = this.currentIntersect
        if (this.currentIntersect?.owner.playerId === this.world.getSessionPlayer()) {
          this.gui.toggleCursor(true)
        }
        this.currentIntersect.toggleRune(true, this.currentIntersect.isSelected)
        this.gui.showRuneOverlay(this.currentIntersect?.type)
      }
    } else {
      if (this.currentIntersect) {
        if (this.currentIntersect?.mesh?.identifier === 'rune') {
          this.currentIntersect?.toggleRune(false, this.previousIntersect?.isSelected)
        }

        this.gui.toggleCursor(false)
        this.previousIntersect = null
      }

      this.currentIntersect = null
    }
  }

  update() {
    this.handleRuneHover()
  }
}
