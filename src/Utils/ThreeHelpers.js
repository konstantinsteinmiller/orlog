// Rotate an object around an arbitrary axis in world space
import { THREE } from 'enable3d'

export const rotateAroundWorldAxis = (object, axis, radians) => {
  var rotWorldMatrix
  rotWorldMatrix = new THREE.Matrix4()
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians)
  rotWorldMatrix.multiply(object.matrix) // pre-multiply

  object.matrix = rotWorldMatrix
  object.rotation.setFromRotationMatrix(object.matrix)
}

// const yAxis = new THREE.Vector3(0, 1, 0)
// rotateAroundWorldAxis(dice.group, yAxis, Math.PI / 2)

export const disposeMeshAndRemoveFromScene = (mesh, scene) => {
  if (mesh instanceof THREE.Mesh) {
    mesh.geometry.dispose()

    // Loop through the material properties
    for (const key in mesh.material) {
      const value = mesh.material[key]

      // Test if there is a dispose function
      if (value && typeof value.dispose === 'function') {
        value.dispose()
      }
    }
  }
  scene.remove(mesh)
  mesh = null
}
