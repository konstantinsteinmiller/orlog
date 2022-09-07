import EventEmitter from '@/Utils/EventEmitter.js'
import { KEYBOARD_STATE_MODIFIERS, KEYBOARD_STATE_ALIAS } from '@/Utils/constants.js'

export default class Input extends EventEmitter {
  constructor() {
    super()
    this.x = 0
    this.y = 0
    this.cursor = {
      x: 0,
      y: 0,
    }
    this.sizes = experience.sizes
    this.canvas = experience.canvas

    // to store the current state
    this.keyCodes = {}
    this.modifiers = {}

    // bind keyEvents
    document.onmousemove = (event) => this.onMouseMove(event)
    document.onkeydown = (event) => this.onKeyDown(event)
    document.onkeyup = (event) => this.onKeyUp(event)
    document.onclick = (event) => this.onClick(event)
    document.ondblclick = (event) => this.onDoubleClick(event)
  }

  destroy() {
    document.removeEventListener('mousemove', (event) => this.onMouseMove(event))
    document.removeEventListener('keydown', (event) => this.onKeyDown(event))
    document.removeEventListener('keyup', (event) => this.onKeyUp(event))
    document.removeEventListener('click', (event) => this.onClick(event))
    document.removeEventListener('dblclick', (event) => this.onDoubleClick(event))
  }

  onMouseMove(event) {
    this.cursor.x = event.clientX / this.canvas.clientWidth - 0.5 /* * 2*/
    this.cursor.y = event.clientY / this.canvas.clientHeight - 0.5 /* * 2*/
    this.x = (event.clientX / this.canvas.clientWidth - 0.5) * 2
    this.y = -(event.clientY / this.canvas.clientHeight - 0.5) * 2

    this.trigger('mousemove', [event])
  }

  onKeyDown(event) {
    this.onKeyChange(event, true)
    this.trigger('keydown', [event])
  }

  onKeyUp(event) {
    this.onKeyChange(event, false)
    this.trigger('keyup', [event])
  }

  onKeyChange(event, isPressed) {
    /* console.log(
      'onKeyChange',
      event,
      isPressed,
      event.keyCode,
      event.shiftKey,
      event.ctrlKey,
      event.altKey,
      event.metaKey,
    )*/

    this.keyCodes[event.keyCode] = isPressed
    this.modifiers['shift'] = event.shiftKey
    this.modifiers['ctrl'] = event.ctrlKey
    this.modifiers['alt'] = event.altKey
    this.modifiers['meta'] = event.metaKey
  }

  onClick(event) {
    this.trigger('click', [event])
  }

  onDoubleClick(event) {
    this.trigger('dblclick', [event])
  }

  isKeyPressed(keyDesc) {
    const requestedKeys = keyDesc.split('+')
    for (let i = 0; i < requestedKeys.length; i++) {
      const key = requestedKeys[i]
      let isPressed = false
      if (KEYBOARD_STATE_MODIFIERS.indexOf(key) !== -1) {
        isPressed = this.modifiers[key]
      } else if (Object.keys(KEYBOARD_STATE_ALIAS).indexOf(key) !== -1) {
        isPressed = this.keyCodes[KEYBOARD_STATE_ALIAS[key]]
      } else {
        isPressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
      }
      if (!isPressed) {
        return false
      }
    }
    return true
  }

  update() {}
}
