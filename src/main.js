import './app.css'
import './style.scss'

import Experience from '@/Experience.js'
import { PhysicsLoader } from 'enable3d/dist/index'
import MainMenu from './Menus/MainMenu'
import Resources from '@/Utils/Resources.js'
import { setStorage, getStorage } from '@/Utils/storage.js'
import { GAME_BACKGROUND_VOLUME, GAME_TYPES } from '@/Utils/constants.js'

let isLoadingPhysics = true
const mainMenu = new MainMenu(isLoadingPhysics)

PhysicsLoader('lib/ammo', () => {
  isLoadingPhysics = false
  mainMenu.updateLoaderComponentName('')

  const resources = new Resources()
  resources.on('loaded-source', (loaded, toLoad, name) => {
    mainMenu.updateLoaderComponentName(name)
    if (name === 'backgroundMusic') {
      mainMenu.setBackgroundMusic()
    }
    if (loaded === toLoad) {
      setTimeout(() => {
        mainMenu.updateLoaderComponentName('')
        setTimeout(() => {
          mainMenu.removeLoader()
          location.hash.includes('debug') && mainMenu.onStartClick() // DEBUG only
        }, 200)
      })
    }
  })
  // const experience = new Experience(mainMenu)
})

mainMenu.on('start-game', () => {
  if (!isLoadingPhysics) {
    mainMenuId.style.display = 'none'
    const experience = new Experience(GAME_TYPES.GAME_TYPE_NPC)
  } else {
    PhysicsLoader('lib/ammo', () => {
      isLoadingPhysics = false
      mainMenu.updateLoaderComponentName('')
      // const experience = new Experience(mainMenu)
    })
  }
})

mainMenu.on('join-multiplayer-game', () => {
  if (!isLoadingPhysics) {
    mainMenuId.style.display = 'none'
    const experience = new Experience(GAME_TYPES.GAME_TYPE_MULTIPLAYER)
  } else {
    PhysicsLoader('lib/ammo', () => {
      isLoadingPhysics = false
      mainMenu.updateLoaderComponentName('')
      // const experience = new Experience(mainMenu)
    })
  }
})

// PhysicsLoader('lib/ammo', () => {
//   const experience = new Experience(mainMenu)
// })

// const images = document.querySelectorAll('.dice-layout > img.selection--disabled:not(img#diceFaces)')
// Array.prototype.forEach.call(images, (img) => {
//   img.style.display = 'none'
// })

window.onload = () => {
  let hasInteracted = false
  let isPlaying = false
  const onInteracted = () => {
    hasInteracted = true
    window.removeEventListener('scroll', () => onInteracted())
    window.removeEventListener('click', () => onInteracted())
    playBackgroundMusic()
  }
  window.onscroll = () => onInteracted()
  window.onclick = () => onInteracted()

  const playBackgroundMusic = () => {
    if (hasInteracted && !isPlaying) {
      isPlaying = true
      backgroundMusicId.src = '/public/sounds/price-of-freedom-short6.ogg'

      musicVolumeId.value = parseFloat(getStorage(GAME_BACKGROUND_VOLUME, true)) ?? 0.02

      backgroundMusicId.volume = musicVolumeId.value
      backgroundMusicId.repeat = true
      backgroundMusicId.play()
      musicVolumeId.onchange = () => {
        backgroundMusicId.volume = musicVolumeId.value
        setStorage(GAME_BACKGROUND_VOLUME, musicVolumeId.value, true)
      }
    }
  }
}
