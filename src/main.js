import './style.scss'

import Experience from '@/Experience.js'
import { PhysicsLoader } from 'enable3d/dist/index'

PhysicsLoader('lib/ammo', () => {
  const experience = new Experience()
})
