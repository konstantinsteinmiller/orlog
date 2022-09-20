import {
  GAMES_PHASES,
  GAME_RUNES_DESCRIPTIONS,
  RUNE_RESOLUTION_TYPES_DESCRIPTION,
} from '@/Utils/constants.js'
import Experience from '@/Experience.js'
import faithTokenImage from '/public/textures/ui/faithToken.png'

export default class GUI {
  constructor() {
    this.experience = new Experience()
    this.world = this.experience.world

    this.isShowingRuneInfo = false
  }

  showControlsOverlay(isVisible) {
    $controlsInfo.style.opacity = isVisible ? 0.8 : 0
  }

  showFaithControlsOverlay(isVisible) {
    $controlsFaithInfo.style.opacity = isVisible ? 0.8 : 0
  }

  showPhaseOverlay(isVisible) {
    $phaseOverlay.innerText = `${GAMES_PHASES[this.world.currentGamePhase].replace('_', ' ')} PHASE`
    $phaseOverlay.style.opacity = isVisible ? 0.8 : 0
    setTimeout(() => {
      $phaseOverlay.style.opacity = 0
    }, 3000)
  }

  showRuneOverlay(isVisible, type) {
    console.log('type: ', type)
    const rune = GAME_RUNES_DESCRIPTIONS[type]
    const typeDescription = RUNE_RESOLUTION_TYPES_DESCRIPTION[rune?.type]
    runeName.innerText = rune.name
    runeDescription.innerText = rune.description

    let $tierCost = document.querySelector('#runeTier1 .tier-cost')
    $tierCost.innerText = rune.tier1.cost.faith
    let $tierCostImg = runeTier1.querySelector('.tier-cost-img')
    $tierCostImg.src = faithTokenImage
    let $tierText = runeTier1.querySelector('.tier-text')
    $tierText.innerText = rune.tier1.text

    $tierCost = runeTier2.querySelector('.tier-cost')
    $tierCost.innerText = rune.tier2.cost.faith
    $tierCostImg = runeTier2.querySelector('.tier-cost-img')
    $tierCostImg.src = faithTokenImage
    $tierText = runeTier2.querySelector('.tier-text')
    $tierText.innerText = rune.tier2.text

    $tierCost = runeTier3.querySelector('.tier-cost')
    $tierCost.innerText = rune.tier3.cost.faith
    $tierCostImg = runeTier3.querySelector('.tier-cost-img')
    $tierCostImg.src = faithTokenImage
    $tierText = runeTier3.querySelector('.tier-text')
    $tierText.innerText = rune.tier3.text

    runeType.innerText = `When: ${typeDescription}`
    runeType.dataset.type = type
    runeInfo.style.opacity = isVisible ? 0.8 : 0
    this.isShowingRuneInfo = isVisible
  }

  toggleCursor(isPointer) {
    $gameWrapper.style.cursor = isPointer ? 'pointer' : 'default'
  }
}
