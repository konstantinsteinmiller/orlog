import './style.scss'
import './main-menu.scss'

import Experience from '@/Experience.js'
import { PhysicsLoader } from 'enable3d/dist/index'

import MainMenu from './Menus/MainMenu'
const mainMenu = new MainMenu()
let isLoadingPhysics = true

PhysicsLoader('lib/ammo', () => {
  isLoadingPhysics = false
  // const experience = new Experience(mainMenu)
})
mainMenu.on('start-game', () => {
  if (!isLoadingPhysics) {
    mainMenuId.style.display = 'none'
    const experience = new Experience(mainMenu)
  } else {
    PhysicsLoader('lib/ammo', () => {
      isLoadingPhysics = false
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
