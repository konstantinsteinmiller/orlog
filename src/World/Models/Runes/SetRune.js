import { GAME_PLAYER_TYPES, GAMES_RUNES } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'

export default class SetRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_SET, player)
    this.rayCaster = new THREE.Raycaster()
    this.camera = this.experience.camera.instance
    this.input = this.experience.input
    this.currentIntersect = null
    this.previousIntersect = null

    this.maxDiceToChoseAmount = 0
    this.diceSelectedAmount = 0

    this.handleDiceHoverInterval = null
    this.resolve = () => {}

    this.experience.input.on('click', () => {
      if (this.world.isDiceResolutionPhase() && this.startedSelection === true && this.owner.isPlayerAtTurn) {
        this.world.gui.noUserActionTimeout = Date.now()

        this.toggleDiceSelection()
      }
    })

    this.experience.input.on('dblclick', () => {
      if (this.world.isDiceResolutionPhase() && this.startedSelection === true) {
        clearInterval(this.handleDiceHoverInterval)
        this.defenderPlayer.dicesHandler.dicesList.forEach((die) => {
          if (die?.isMarkedForRemoval) {
            die.moveDieBackToStart()
            die.toggleDice(false, false)
          }
        })
        this.experience.sounds.playSound('crazyLaugh')
        this.resolve()
      }
    })
  }

  async beforeResolution() {
    this.defenderPlayer = this.world.getEnemyPlayer(this.owner.playerId)

    return this.resolution((resolve, tier) => {
      if (this.owner.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC) {
        setTimeout(async () => {
          this.experience.sounds.playSound('crazyLaugh')
          await this.owner.strategyManager.selectEnemyDices(tier.value)
          resolve()
        }, 800)
      } else {
        this.resolve = resolve
        this.gui = this.world.gui
        this.maxDiceToChoseAmount = tier.value
        this.diceSelectedAmount = 0

        this.gui.showControlsOverlayDelayed()

        this.handleDiceHoverInterval = setInterval(() => {
          this.startedSelection = true
          this.handleDiceHover()
        }, 25)
      }
    })
  }

  handleDiceHover() {
    if (!this.world.isDiceResolutionPhase()) {
      return
    }
    this.rayCaster.setFromCamera(new THREE.Vector2(this.input.x, this.input.y), this.camera)

    const intersections = this.rayCaster.intersectObjects(
      this.defenderPlayer.dicesHandler.dicesList.map((die) => die.group.children[0]),
    )

    if (intersections.length) {
      this.currentIntersect = intersections[0].object
      this.defenderPlayer.dicesHandler.dicesList.forEach((dice) => {
        dice.highlightMesh.isHighlighted =
          this.currentIntersect.name === dice?.mesh.name && !dice.highlightMesh?.isPlaced
      })
      this.owner.dicesHandler.evaluateTopFace()
      this.gui.setDiceTopFaceHighlighter(this.currentIntersect)

      if (
        this.owner.dicesHandler.isPlayer &&
        this.currentIntersect?.userData?.playerId !== this.owner.playerId
      ) {
        this.gui.toggleCursor(true)
      }
    } else {
      this.removeCurrentIntersect()
    }
  }

  removeCurrentIntersect() {
    if (this.currentIntersect) {
      if (this.previousIntersect?.name !== this.currentIntersect?.name) {
        // this.experience.debug.isActive && console.log('NEW Intersect: ', this.currentIntersect)
      }
      if (this.currentIntersect.parent) {
        this.currentIntersect.parent.getObjectByName('diceHighlight').isHighlighted = false
      }
      this.gui.toggleCursor(false)
      this.gui.hideDiceFaceLayout()
    }
    this.previousIntersect = { name: this.currentIntersect?.name }
    this.currentIntersect = null
  }

  toggleDiceSelection() {
    this.gui.noUserActionTimeout = Date.now()
    this.gui.showControlsOverlay(false)

    const player = this.owner
    if (this.currentIntersect) {
      // if (player.isPlayerAtTurn && this.currentIntersect.userData?.playerId !== player.playerId) {
        // this.experience.debug.isActive && console.log('got an enemy dice')
        // console.log('this.currentIntersect: ', this.currentIntersect.userData?.playerId, this.playerId)
      // }

      const diceHighlightMesh = this.currentIntersect?.parent?.getObjectByName('diceHighlight')
      if (diceHighlightMesh?.isPlaced) {
        this.defenderPlayer.dicesHandler.dicesList.some((die) => {
          const isToBeMarkedDice = die.mesh.name === this.currentIntersect.name
          if (isToBeMarkedDice) {
            if (
              this.diceSelectedAmount < this.maxDiceToChoseAmount ||
              die.isMarkedForRemoval ||
              (this.diceSelectedAmount === this.maxDiceToChoseAmount && die.isMarkedForRemoval)
            ) {
              die.toggleMarkForRemoval()
            }
          }
          return isToBeMarkedDice
        })

        this.diceSelectedAmount = this.defenderPlayer.dicesHandler.dicesList.filter(
          (die) => die.isMarkedForRemoval,
        ).length
      }
    }
  }
}
