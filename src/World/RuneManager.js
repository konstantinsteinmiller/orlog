import Experience from '@/Experience.js'
import Rune from '@/World/Models/Rune.js'
import { GAMES_PHASES, GAMES_RUNES } from '@/Utils/constants.js'

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
    this.actionAfterDiceRollTimeout = null

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
      new Rune(11, GAMES_RUNES.RUNE_BABI, this.isPlayer, this),
      new Rune(12, GAMES_RUNES.RUNE_NEPHTHYS, this.isPlayer, this),
    ]

    this.runesMeshes = Object.values(this.world.players).reduce(
      (runeMeshesList, player) => runeMeshesList.concat(player.runes.map((rune) => rune.mesh)),
      [],
    )

    this.input.on('click', (event) => {
      this.gui.showFaithControlsOverlay(false)

      if (this.gui.isShowingRuneInfo) {
        this.gui.showRuneOverlay(false, this.currentIntersect?.type)
        this.currentIntersect.owner.runes.forEach(
          (rune) => this.currentIntersect.type !== rune.type && rune.toggleRune(false, false),
        )

        /* a tier was selected */
        if (event.target?.classList.contains('tier--selected') && this.world.isFaithCastingPhase()) {
          this.gui.toggleCursor(false)
          const sessionPlayer = this.world.players[this.world.getSessionPlayerId()]
          sessionPlayer.runes.forEach((rune) => (rune.selectedTier = null))
          const rune = sessionPlayer.runes.find((rune) => rune?.type === runeType.dataset.type)

          rune?.toggleRune(rune.isHighLighted, true)
          rune.selectedTier = event.target.dataset?.tier ? `tier${event.target.dataset?.tier}` : null
          this.showControlHint()
        }
      } else {
        this.showControlHint()

        this.toggleRuneSelection()
      }
    })

    this.input.on('dblclick', (event) => {
      this.actionAfterDiceRollTimeout = Date.now()
      this.gui.showFaithControlsOverlay(false)
      if (this.world.isSessionPlayerAtTurn()) {
        const sessionPlayer = this.world.getPlayerAtTurn()
        sessionPlayer.trigger(GAMES_PHASES.DICE_RESOLVE)
      }
    })
  }

  toggleRuneSelection() {
    if (this.world.isFaithCastingPhase && this.currentIntersect?.mesh?.identifier === 'rune') {
      if (!this.currentIntersect?.isPlayer) {
        this.debug.isActive && console.log('YOU cant activate enemies Runes')
        return
      }

      this.gui.showRuneOverlay(true, this.currentIntersect?.type)
      this.gui.toggleCursor(false)
      this.currentIntersect?.toggleRune(true, false)
      this.currentIntersect.owner.runes.forEach(
        (rune) => this.currentIntersect.type !== rune.type && rune.toggleRune(false, false),
      )
    }
  }

  handleRuneHover() {
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(this.runesMeshes)
    if (this.gui.isShowingRuneInfo) {
      return
    }

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

        if (this.currentIntersect?.owner?.playerId === this.world.getSessionPlayerId()) {
          this.gui.toggleCursor(true)
        }
        this.currentIntersect.toggleRune(true, this.currentIntersect.isSelected)
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

  showControlHint() {
    /* show action input overlay */
    const isSessionPlayerAtTurn = this.world.isSessionPlayerAtTurn()
    this.actionAfterDiceRollTimeout = Date.now()

    isSessionPlayerAtTurn &&
      setTimeout(() => {
        if (Date.now() - this.actionAfterDiceRollTimeout > 7000 && this.world.isFaithCastingPhase()) {
          this.gui.showFaithControlsOverlay(true)
        }
      }, 7000)
  }

  update() {
    this.handleRuneHover()
  }
}
