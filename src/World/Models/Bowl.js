import * as THREE from 'three'
import { toTrianglesDrawMode } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import * as CANNON from 'cannon-es'
// import { threeToCannon, ShapeType } from 'three-to-cannon'
// import { geometryToShape } from '@/Utils/ThreeConversionUtils.js'
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry'
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull'

export default class Bowl {
  constructor(position = new THREE.Vector3(0, 0, 0), rotation = new THREE.Vector3(0, 0, 0)) {
    this.experience = experience
    this.scene = this.experience.scene
    this.physicsWorld = this.experience.world.physicsWorld
    this.resources = this.experience.resources

    this.position = position
    this.rotation = rotation
    this.scale = 1

    this.setMesh()
    this.setBody()
  }
  update() {}

  setMesh() {
    this.mesh = this.resources.items['bowl'].scene.children[0].clone(true)

    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.position.copy(this.position)
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z)

    this.scene.add(this.mesh)

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
  }

  setBody() {
    // Cannon body
    /* let vertices = []
    for (let i = 0; i < this.mesh.geometry.attributes.position.array.length; i += 3) {
      let x = this.mesh.geometry.attributes.position.array[i]
      let y = this.mesh.geometry.attributes.position.array[i + 1]
      let z = this.mesh.geometry.attributes.position.array[i + 2]
      vertices.push(new CANNON.Vec3(x, y, z))
    }
    console.log(vertices)
    let faces = []
    const position = this.mesh.geometry.getAttribute('position')

    console.log('position: ', position)
    for (let i = 0; i < position.array.length; i += 3) {
      const a = position.array[i]
      const b = position.array[i + 1]
      const c = position.array[i + 2]
      faces.push(new CANNON.Vec3(a, b, c))
    }*/
    // console.log(faces)

    const extrudeSettings = {
      depth: 2,
      steps: 1,
      bevelEnabled: false,
      curveSegments: 8,
    }

    const arcShape = new THREE.Shape()
    arcShape.absarc(0, 0, 4, 0, Math.PI * 2, 0, false)

    const holePath = new THREE.Path()
    holePath.absarc(0, 0, 3.5, 0, Math.PI * 2, true)
    arcShape.holes.push(holePath)

    const geo = new THREE.ExtrudeBufferGeometry(arcShape, extrudeSettings)
    const mat = new THREE.MeshBasicMaterial({ color: 'khaki' })
    const mesh = new THREE.Mesh(geo, mat)
    geo.translate(0, 0, -1) // somehow this has an offset as well :/
    mesh.rotateX(Math.PI / 2)
    mesh.position.y = 5
    this.scene.add(mesh)

    this.body = new CANNON.Body({
      mass: 1,
      // shape: shape,
      material: new CANNON.Material('default'),
    })

    // this.body.addShape(shape)
    this.body.position.copy(new CANNON.Vec3(0, 0.5, 0))
    this.body.quaternion.copy(this.mesh.quaternion)
    this.physicsWorld.addBody(this.body)
  }
}
