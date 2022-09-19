import { GAMES_PHASES } from '@/Utils/constants.js'
import Experience from '@/Experience.js'

export default class GUI {
  constructor() {
    this.experience = new Experience()
    this.world = this.experience.world
  }

  showControlsOverlay(isVisible) {
    $controlsInfo.style.opacity = isVisible ? 0.8 : 0
  }

  showPhaseOverlay(isVisible) {
    $phaseOverlay.innerText = `${GAMES_PHASES[this.world.currentGamePhase].replace('_', ' ')} PHASE`
    $phaseOverlay.style.opacity = isVisible ? 0.8 : 0
    setTimeout(() => {
      $phaseOverlay.style.opacity = 0
    }, 3000)
  }

  showRuneOverlay(type) {
    // console.log('showRuneOverlay: ', type)
    // $phaseOverlay.innerText = `${GAMES_PHASES[this.world.currentGamePhase].replace('_', ' ')} PHASE`
    // $phaseOverlay.style.opacity = isVisible ? 0.8 : 0
    // setTimeout(() => {
    //   $phaseOverlay.style.opacity = 0
    // }, 3000)
  }

  toggleCursor(isPointer) {
    webgl.style.cursor = isPointer ? 'pointer' : 'default'
  }
}
