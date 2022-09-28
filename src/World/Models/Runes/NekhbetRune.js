import { GAME_PLAYER_TYPES, GAMES_RUNES, HIGHLIGHT_POSITION_MAP } from '@/Utils/constants.js'
import Rune from '@/World/Models/Rune.js'
import dice1Img from '/public/textures/dices/dice1.jpg'
import dice2Img from '/public/textures/dices/dice2.jpg'
import dice3Img from '/public/textures/dices/dice3.jpg'
import dice4Img from '/public/textures/dices/dice4.jpg'
import dice5Img from '/public/textures/dices/dice5.jpg'
import dice6Img from '/public/textures/dices/dice6.jpg'
const images = [dice1Img, dice2Img, dice3Img, dice4Img, dice5Img, dice6Img]

export default class NekhbetRune extends Rune {
  constructor(id, player) {
    super(id, GAMES_RUNES.RUNE_NEKHBET, player)
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

    this.experience.input.on('dblclick', async () => {
      if (this.world.isDiceResolutionPhase() && this.startedSelection === true) {
        clearInterval(this.handleDiceHoverInterval)

        this.defenderPlayer.dicesHandler.dicesList.forEach((die) => {
          if (die?.isMarkedForSteal) {
            die.moveForward()
            die.changeDieOwner(this.owner)
          }
        })

        this.defenderPlayer.dicesHandler.removeStolenDices()

        /* only move dice to enemy after all owner were adjusted */
        await new Promise(async (resolve) => {
          this.removeCurrentIntersect()
          this.owner.dicesHandler.moveSelectedDicesToEnemy()
          setTimeout(() => {
            resolve()
          }, 4500)
        })

        this.experience.sounds.playSound('laughEvil')
        this.resolve()
      }
    })
  }

  async beforeResolution() {
    this.defenderPlayer = this.world.getEnemyPlayer(this.owner.playerId)

    return this.resolution((resolve, tier) => {
      if (this.owner.playerId === GAME_PLAYER_TYPES.GAME_PLAYER_TYPE_NPC) {
        setTimeout(async () => {
          this.experience.sounds.playSound('laughEvil')
          await this.owner.strategyManager.selectEnemyDicesToSteal(tier.value)
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

  async afterResolution() {
    return Promise.resolve()
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
      this.setDiceTopFaceHighlighter()

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
      diceFacesLayout.style.opacity = 0
    }
    this.previousIntersect = { name: this.currentIntersect?.name }
    this.currentIntersect = null
  }

  setDiceTopFaceHighlighter() {
    if (this.currentIntersect.name.substring(0, 4) === 'Dice') {
      const diceModelNumber = this.currentIntersect.name.substring(4, 5)
      diceFacesLayout.style.opacity = 0.8
      const upwardFace = this.currentIntersect?.userData?.upwardFace
      if (upwardFace) {
        faceHighlight.style.top = HIGHLIGHT_POSITION_MAP?.[upwardFace].top
        faceHighlight.style.right = HIGHLIGHT_POSITION_MAP?.[upwardFace].right
      }
      diceFaces.src = images[diceModelNumber - 1]
    }
  }

  toggleDiceSelection() {
    this.gui.noUserActionTimeout = Date.now()
    this.gui.showControlsOverlay(false)

    const player = this.owner
    if (this.currentIntersect) {
      if (player.isPlayerAtTurn && this.currentIntersect.userData?.playerId !== player.playerId) {
        // this.experience.debug.isActive && console.log('got an enemy dice')
        // console.log('this.currentIntersect: ', this.currentIntersect.userData?.playerId, this.playerId)
      }

      const diceHighlightMesh = this.currentIntersect?.parent?.getObjectByName('diceHighlight')
      if (diceHighlightMesh?.isPlaced) {
        this.defenderPlayer.dicesHandler.dicesList.some((die) => {
          const isToBeMarkedDice = die.mesh.name === this.currentIntersect.name
          if (isToBeMarkedDice) {
            if (
              this.diceSelectedAmount < this.maxDiceToChoseAmount ||
              die.isMarkedForSteal ||
              (this.diceSelectedAmount === this.maxDiceToChoseAmount && die.isMarkedForSteal)
            ) {
              die.toggleMarkForSteal()
            }
          }
          return isToBeMarkedDice
        })

        this.diceSelectedAmount = this.defenderPlayer.dicesHandler.dicesList.filter(
          (die) => die.isMarkedForSteal,
        ).length
      }
    }
  }
}
