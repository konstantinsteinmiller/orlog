import Dice, { diceMap } from '@/World/Models/Dice.js'

export default class DicesHandler {
  constructor() {
    this.scene = experience.scene
    this.physics = experience.physics
    this.debug = experience.debug
    this.mouse = experience.mouse
    this.camera = experience.camera.instance
    this.dicesList = []

    this.createDices()

    // Debug
    if (this.debug.isActive) {
      this.debugFolder = this.debug.ui.addFolder('meshes')
      this.debugFolder.add(this, 'createDices')
    }

    this.onDblClick = () => {
      this.dicesList.forEach((dice) => {
        // const child = dice.group.children[0]
        const childUp = dice.group.getObjectByName('upSideDetector')
        const childFront = dice.group.getObjectByName('frontSideDetector')
        const childRight = dice.group.getObjectByName('rightSideDetector')

        /* to get the current world position of the dice, we need to detach from the parent group */
        this.scene.attach(childUp) // detach from parent and add to scene
        this.scene.attach(childFront)
        this.scene.attach(childRight)
        dice.group.attach(childUp) // reattach to original parent
        dice.group.attach(childFront)
        dice.group.attach(childRight)

        var worldPosUp = new THREE.Vector3().applyMatrix4(childUp.matrixWorld)
        var worldPosFront = new THREE.Vector3().applyMatrix4(childFront.matrixWorld)
        var worldPosRight = new THREE.Vector3().applyMatrix4(childRight.matrixWorld)

        const Uy = worldPosUp.y.toFixed(2)
        const Fy = worldPosFront.y.toFixed(2)
        const Ry = worldPosRight.y.toFixed(2)
        // console.log('Uy, Fy, Ry: ', Uy, Fy, Ry)
        if (Uy > Fy && Uy > Ry) {
          console.error(`Y Top // ${diceMap[1].top.symbol} ${diceMap[1].top.isGolden ? 'Golden' : ''}`)
        }
        if (Uy < Fy && Uy < Ry) {
          console.error(
            `-Y Bottom // ${diceMap[1].bottom.symbol} ${diceMap[1].bottom.isGolden ? 'Golden' : ''}`,
          )
        }
        if (Fy > Uy && Fy > Ry) {
          console.error(`Z Front // ${diceMap[1].front.symbol} ${diceMap[1].front.isGolden ? 'Golden' : ''}`)
        }
        if (Fy < Uy && Fy < Ry) {
          console.error(`-Z Back // ${diceMap[1].back.symbol} ${diceMap[1].back.isGolden ? 'Golden' : ''}`)
        }
        if (Ry > Uy && Ry > Fy) {
          console.error(`X Right // ${diceMap[1].right.symbol} ${diceMap[1].right.isGolden ? 'Golden' : ''}`)
        }
        if (Ry < Uy && Ry < Fy) {
          console.error(`-X Left // ${diceMap[1].left.symbol} ${diceMap[1].left.isGolden ? 'Golden' : ''}`)
        }
      })
    }
    window.ondblclick = this.onDblClick

    this.onClick = () => {
      console.log('this.mouse.x, this.mouse.y: ', this.mouse.x, this.mouse.y);
      this.rayCaster.setFromCamera(new THREE.Vector2(this.mouse.x, this.mouse.y), this.camera)

      const diceMeshes = this.dicesList.map(
        (dice) =>
          // console.log('dice.group.children[0]: ', dice.group.children[0])
          dice.group.children[0],
      )
      console.log('diceMeshes: ', diceMeshes)
      const intersections = this.rayCaster.intersectObjects(diceMeshes)
      console.log('intersections: ', intersections)
    }
    window.onclick = this.onClick

    this.createHoverRayCaster()
    // webgl.onclick = (dices) => this.randomDiceThrow(dices)
  }
  destructor() {
    window.removeEventListener('dblclick', this.onDblClick)
    window.removeEventListener('click', this.onClick)
  }
  /*randomDiceThrow() {
    var diceValues = []
    console.log('randomDiceThrow: ', this.dices)
    for (var i = 0; i < this.dices.length; i++) {
      let yRand = Math.random() * 20 + 2
      this.dices[i].getObject().position.x = -15 - (i % 3) * 1.5
      this.dices[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5
      this.dices[i].getObject().position.z = -15 + (i % 3) * 1.5
      this.dices[i].getObject().quaternion.x = ((Math.random() * 90 - 45) * Math.PI) / 180
      this.dices[i].getObject().quaternion.z = ((Math.random() * 90 - 45) * Math.PI) / 180
      this.dices[i].updateBodyFromMesh()
      let rand = Math.random() * 5
      this.dices[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand)
      this.dices[i]
        .getObject()
        .body.angularVelocity.set(20 * Math.random() - 10, 20 * Math.random() - 10, 20 * Math.random() - 10)

      diceValues.push({ dice: this.dices[i], value: i + 1 })
    }

    DiceManager.prepareValues(diceValues)
  }*/
  createDices() {
    this.diceGroup = new THREE.Group({ name: 'diceGroup' })
    this.diceGroup.name = 'diceGroup'
    this.dicesList = [
      new Dice(this.diceGroup, 1, new THREE.Vector3(-0.5, 3, 0), new THREE.Vector3(0, 0, 1)),
      // new Dice(this.diceGroup, 2, new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 0, PI * 0.5)),
      // new Dice(this.diceGroup, 3, new THREE.Vector3(0.5, 3, 0), new THREE.Vector3(0, 0, PI)),
      // new Dice(this.diceGroup, 4, new THREE.Vector3(-0.5, 3, 0.6), new THREE.Vector3(0, 0, PI * 1.5)),
      // new Dice(this.diceGroup, 5, new THREE.Vector3(0, 3, 0.6), new THREE.Vector3(PI * 0.5, 0, 0)),
      // new Dice(this.diceGroup, 6, new THREE.Vector3(0.5, 3, 0.6), new THREE.Vector3(PI * 0.5, PI, PI * 1.5)),
    ]
    this.scene.add(this.diceGroup)
  }
  createHoverRayCaster() {
    this.rayCaster = new THREE.Raycaster()
  }
  update() {
    /*this.dicesList.forEach((dice) => {
      dice.mesh.position.copy(dice.body.position)
      dice.mesh.quaternion.copy(dice.body.quaternion)
    })*/
  }
}
