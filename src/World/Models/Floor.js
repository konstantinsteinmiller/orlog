import Experience from '@/Experience.js'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export default class Floor {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.physicsWorld = this.experience.world.physicsWorld
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
      envMap: this.resources.items.environmentMapTexture,
      metalness: 0.3,
      roughness: 0.4,
    })
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.rotation.x = -Math.PI * 0.5
    // this.mesh.position.y = -1
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  setPhysicsBody() {
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.position.copy(this.mesh.position)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
    this.physicsWorld.addBody(floorBody)
  }
}
