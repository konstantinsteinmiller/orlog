import {
  GAMES_PHASES,
  GAME_RUNES_DESCRIPTIONS,
  RUNE_RESOLUTION_TYPES_DESCRIPTION, HIGHLIGHT_POSITION_MAP,
} from '@/Utils/constants.js';
import Experience from '@/Experience.js'
import faithTokenImage from '/public/textures/ui/faithTokenAnkh.png'
import dice1Img from '/public/textures/dices/dice1.jpg'
import dice2Img from '/public/textures/dices/dice2.jpg'
import dice3Img from '/public/textures/dices/dice3.jpg'
import dice4Img from '/public/textures/dices/dice4.jpg'
import dice5Img from '/public/textures/dices/dice5.jpg'
import dice6Img from '/public/textures/dices/dice6.jpg'
const images = [dice1Img, dice2Img, dice3Img, dice4Img, dice5Img, dice6Img]

export default class GUI {
  constructor() {
    this.experience = new Experience()
    this.world = this.experience.world
    this.noUserActionTimeout = 0

    this.isShowingRuneInfo = false
  }

  showControlsOverlay(isVisible) {
    $controlsInfo.style.opacity = isVisible ? 0.8 : 0
  }

  showControlsOverlayDelayed(noUserActionTimeout) {
    /* show action input overlay */
    this.world.isSessionPlayerAtTurn() &&
      setTimeout(() => {
        const timeDiff = noUserActionTimeout
          ? Date.now() - noUserActionTimeout
          : Date.now() - this.noUserActionTimeout
        if (timeDiff > 7000 && this.world.isDiceRollPhase()) {
          this.showControlsOverlay(true)
        }
      }, 7000)
  }

  showFaithControlsOverlay(isVisible) {
    $controlsFaithInfo.style.opacity = isVisible ? 0.8 : 0
  }

  showFaithControlsOverlayDelayed() {
    this.noUserActionTimeout = Date.now()

    this.world.isSessionPlayerAtTurn() &&
      setTimeout(() => {
        if (
          Date.now() - this.noUserActionTimeout > 7000 &&
          this.world.isFaithCastingPhase() &&
          !this.isShowingRuneInfo
        ) {
          this.showFaithControlsOverlay(true)
        }
      }, 7000)
  }

  showPhaseOverlay(isVisible) {
    $phaseOverlay.innerText = `${GAMES_PHASES[this.world.currentGamePhase].replace('_', ' ')} PHASE`
    $phaseOverlay.style.opacity = isVisible ? 0.8 : 0
    setTimeout(() => {
      $phaseOverlay.style.opacity = 0
    }, 3000)
  }

  showRuneOverlay(isVisible, type, player, isPlayerRune = false, isFaithCastingPhase = false) {
    const rune = GAME_RUNES_DESCRIPTIONS[type]
    const runeResolutionDescription = RUNE_RESOLUTION_TYPES_DESCRIPTION[rune?.resolution]
    if (!rune?.resolution) {
      return
    }
    runeName.innerText = rune.name

    runeDescription.innerText = rune.description
    runeInfo.dataset.visible = isVisible

    let $runeTiers = document.querySelectorAll('.tier')
    Array.prototype.forEach.call($runeTiers, (runeTier, index) => {
      runeTier.dataset.owner = isPlayerRune ? 'sessionPlayer' : 'other'
      /* is either player rune and selected or enemy rune and correctly selected tier */
      runeTier.dataset.selected =
        player.selectedRune?.type === type && player.selectedRune?.tier === `tier${index + 1}`
      const $tierCost = runeTier.querySelector('.tier-cost')
      $tierCost.innerText = rune[`tier${index + 1}`].cost.faith
      runeTier.querySelector('.tier-cost-img').src = faithTokenImage
      runeTier.querySelector('.tier-text').innerText = rune[`tier${index + 1}`].text
      runeTier.dataset.castable = isPlayerRune && player.faithTokens.length >= parseInt($tierCost?.innerText)
      runeTier.dataset.disabled = !isFaithCastingPhase && runeInfo.dataset.visible
    })

    runeType.innerText = `When: ${runeResolutionDescription}`
    runeType.dataset.type = type
    runeInfo.style.opacity = isVisible ? 0.8 : 0
    this.isShowingRuneInfo = isVisible
  }

  toggleCursor(isPointer) {
    $gameWrapper.style.cursor = isPointer ? 'pointer' : 'default'
  }

  hideDiceFaceLayout() {
    diceFacesLayout.style.opacity = 0
  }

  setDiceTopFaceHighlighter(currentIntersect) {
    if (currentIntersect.name.substring(0, 4) === 'Dice' && !this.isShowingRuneInfo) {
      const diceModelNumber = currentIntersect.name.substring(4, 5)
      diceFacesLayout.style.opacity = 0.8
      const upwardFace = currentIntersect?.userData?.upwardFace
      if (upwardFace) {
        faceHighlight.style.top = HIGHLIGHT_POSITION_MAP?.[upwardFace].top
        faceHighlight.style.right = HIGHLIGHT_POSITION_MAP?.[upwardFace].right
      }
      diceFaces.src = images[diceModelNumber - 1]
    } else {
      console.error('wrong intersection')
    }
  }
}
