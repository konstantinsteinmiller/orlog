import Experience from '@/Experience.js'
import * as THREE from 'three'
import * as CANNON from 'cannon'
import { DiceManager } from '@/World/dice'

export default class Floor {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.setGeometry()
    this.setTextures()
    this.setMaterial()
    this.setMesh()
    this.setPhysicsBody()
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(16, 16, 1, 1)
  }

  setTextures() {
    this.textures = {}

    this.textures.color = this.resources.items.grassColorTexture
    this.textures.color.encoding = THREE.sRGBEncoding
    this.textures.color.repeat.set(1.5, 1.5)
    this.textures.color.wrapS = THREE.RepeatWrapping
    this.textures.color.wrapT = THREE.RepeatWrapping

    this.textures.normal = this.resources.items.grassNormalTexture
    this.textures.normal.repeat.set(1.5, 1.5)
    this.textures.normal.wrapS = THREE.RepeatWrapping
    this.textures.normal.wrapT = THREE.RepeatWrapping
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.textures.color,
      normalMap: this.textures.normal,
    })
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * 0.5
    this.mesh.position.y = -1
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  setPhysicsBody() {
    let floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: DiceManager.floorBodyMaterial,
    })
    // floorBody.position.set(new CANNON.Vec3(0, -1, 0))
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.experience.world.physicsWorld.addBody(floorBody)
  }
}
