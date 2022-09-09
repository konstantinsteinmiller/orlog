import { Room } from '@colyseus/core'
import { FaithRoomState } from './schema/FaithRoomState.js'
import { Dispatcher } from '@colyseus/command'

import { OnJoinCommand } from './OnJoinCommand.js'

export class FaithRoom extends Room {
  dispatcher = new Dispatcher(this)

  onCreate(options) {
    this.setState(new FaithRoomState())

    this.onMessage('type', (client, data) => {
      console.log('type: client, data: ', client, data)
      const player = this.state.players.get(client.sessionId)
      player.x += data.x
      player.y += data.y
      console.log(client.sessionId + ' at, x: ' + player.x, 'y: ' + player.y)
    })
  }

  onJoin(client, options) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      sessionId: client.sessionId,
    })
    console.log(client.sessionId, 'joined FaithRoom!')
  }

  async onLeave(client, consented) {
    console.log(client.sessionId, 'left FaithRoom! with', !consented && 'out', ' consent')
    // flag client as inactive for other users
    this.state.players.get(client.sessionId).connected = false

    try {
      if (consented) {
        throw new Error('consented leave')
      }

      // allow disconnected client to reconnect into this room until 20 seconds
      await this.allowReconnection(client, 20)

      // client returned! let's re-activate it.
      this.state.players.get(client.sessionId).connected = true
    } catch (e) {
      // 20 seconds expired. let's remove the client.
      this.state.players.delete(client.sessionId)
    }
  }

  onDispose() {
    this.dispatcher.stop()
    console.log('room', this.roomId, 'disposing... FaithRoom')
  }
}
