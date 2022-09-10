import './style.scss'

import Experience from '@/Experience.js'
import { PhysicsLoader } from 'enable3d/dist/index'
import MainMenu from './Menus/MainMenu'
import Resources from '@/Utils/Resources.js'

let isLoadingPhysics = true
const mainMenu = new MainMenu(isLoadingPhysics)

PhysicsLoader('lib/ammo', () => {
  isLoadingPhysics = false
  mainMenu.updateLoaderComponentName('')

  const resources = new Resources()
  resources.on('loaded-source', (loaded, toLoad, name) => {
    mainMenu.updateLoaderComponentName(name)
    if (loaded === toLoad) {
      setTimeout(() => {
        mainMenu.updateLoaderComponentName('')
        setTimeout(() => {
          mainMenu.removeLoader()
        }, 200)
      })
    }
  })
  // const experience = new Experience(mainMenu)
})

mainMenu.on('start-game', () => {
  if (!isLoadingPhysics) {
    mainMenuId.style.display = 'none'
    const experience = new Experience(mainMenu)
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
