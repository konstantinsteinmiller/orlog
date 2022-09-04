import './style.scss'

import Experience from '@/Experience.js'
import { PhysicsLoader } from 'enable3d/dist/index'

PhysicsLoader('lib/ammo', () => {
  const experience = new Experience()
})

// const images = document.querySelectorAll('.dice-layout > img.selection--disabled:not(img#diceFaces)')
// Array.prototype.forEach.call(images, (img) => {
//   img.style.display = 'none'
// })
