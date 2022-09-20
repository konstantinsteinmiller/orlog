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
      // new Rune(0, GAMES_RUNES.RUNE_ANUBIS, this.isPlayer, this),
      // new Rune(1, GAMES_RUNES.RUNE_BAST, this.isPlayer, this),
      // new Rune(2, GAMES_RUNES.RUNE_HORUS, this.isPlayer, this),
      // new Rune(3, GAMES_RUNES.RUNE_ISIS, this.isPlayer, this),
      // new Rune(4, GAMES_RUNES.RUNE_SHU, this.isPlayer, this),
      // new Rune(5, GAMES_RUNES.RUNE_SERQET, this.isPlayer, this),
      // new Rune(6, GAMES_RUNES.RUNE_SETH, this.isPlayer, this),
      // new Rune(7, GAMES_RUNES.RUNE_RA, this.isPlayer, this),
      // new Rune(8, GAMES_RUNES.RUNE_OSIRIS, this.isPlayer, this),
      // new Rune(9, GAMES_RUNES.RUNE_TAWARET, this.isPlayer, this),
      // new Rune(10, GAMES_RUNES.RUNE_NEKHBET, this.isPlayer, this),
      // new Rune(11, GAMES_RUNES.RUNE_BABI, this.isPlayer, this),
      // new Rune(12, GAMES_RUNES.RUNE_NEPHTHYS, this.isPlayer, this),
    ]

    this.runesMeshes = Object.values(this.world.players).reduce(
      (runeMeshesList, player) => runeMeshesList.concat(player.runes.map((rune) => rune.mesh)),
      [],
    )

    this.input.on('click', (event) => {
      this.gui.showFaithControlsOverlay(false)

      const sessionPlayer = this.world.getSessionPlayer()
      /* a tier was selected */
      let tierNode = event.target
      if (event.target?.classList.contains('tier--selected') && !event.target.classList.contains('tier')) {
        tierNode = event.target.parentNode
      }
      const tierBelongsSessionPlayer = tierNode.dataset.owner === 'sessionPlayer'

      if (this.gui.isShowingRuneInfo) {
        if (
          event.target?.classList.contains('tier--selected') &&
          this.world.isFaithCastingPhase() &&
          this.world.isSessionPlayerAtTurn() &&
          tierBelongsSessionPlayer
        ) {
          /* unselect all runes and close the rune overlay */
          const sessionPlayer = this.world.players[this.world.getSessionPlayerId()]
          this.gui.toggleCursor(false)
          const rune = sessionPlayer.runes.find((rune) => rune?.type === runeType.dataset.type)

          if (tierNode.dataset.selected === 'true') {
            sessionPlayer.selectedRune = null
          } else {
            sessionPlayer.selectedRune = {
              rune: rune,
              type: rune.type,
              tier: `tier${tierNode.dataset.tier}`,
            }
          }
          /* set green highlight on selected rune and unselect others */
          sessionPlayer.runes.forEach((rune) =>
            rune.toggleRune(false, sessionPlayer.selectedRune?.type === rune.type),
          )

          this.showControlHint()
          this.gui.showRuneOverlay(
            true,
            this.currentIntersect?.type,
            sessionPlayer,
            tierBelongsSessionPlayer,
            this.world.isFaithCastingPhase(),
          )
          setTimeout(() => {
            /* close rune overlay and reset ownership */
            this.gui.showRuneOverlay(
              false,
              this.currentIntersect?.type,
              sessionPlayer,
              tierBelongsSessionPlayer,
              this.world.isFaithCastingPhase(),
            )
          }, 500)
        } else {
          /* close rune overlay and reset ownership */
          this.gui.showRuneOverlay(
            false,
            this.currentIntersect?.type,
            sessionPlayer,
            tierBelongsSessionPlayer,
            this.world.isFaithCastingPhase(),
          )
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
      // if (!this.currentIntersect?.isPlayer) {
      //   this.debug.isActive && console.log('YOU cant activate enemies Runes')
      //   return
      // }

      this.gui.showRuneOverlay(
        true,
        this.currentIntersect?.type,
        this.currentIntersect.owner,
        this.currentIntersect.owner?.isPlayer,
        this.world.isFaithCastingPhase(),
      )
      this.gui.toggleCursor(false)
      if (this.currentIntersect?.owner.isPlayer) {
        this.currentIntersect?.toggleRune(true, this.currentIntersect.isSelected)
      }
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
        (this.previousIntersect?.type !== this.currentIntersect?.type ||
          this.previousIntersect?.owner.playerId !== this.currentIntersect?.owner.playerId) &&
        this.currentIntersect?.mesh?.identifier === 'rune'
      ) {
        /* get all runes remove their highlight */
        Object.values(this.world.players)
          .reduce((runeMeshesList, player) => runeMeshesList.concat(player.runes), [])
          .forEach((rune) => rune?.toggleRune(false, rune?.isSelected))
        this.previousIntersect = this.currentIntersect

        /* show hand on hover over each rune and highlight it */
        this.gui.toggleCursor(true)
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
        if (
          Date.now() - this.actionAfterDiceRollTimeout > 7000 &&
          this.world.isFaithCastingPhase() &&
          !this.gui.isShowingRuneInfo
        ) {
          this.gui.showFaithControlsOverlay(true)
        }
      }, 7000)
  }

  update() {
    this.handleRuneHover()
  }
}
