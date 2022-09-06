// Rotate an object around an arbitrary axis in world space
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
