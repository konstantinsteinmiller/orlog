import { Room } from '@colyseus/core'
import { FaithRoomState } from './schema/FaithRoomState.js'
import { Dispatcher } from '@colyseus/command'

import { OnJoinCommand, OnLeaveCommand } from './commands/Commands.js'

export class FaithRoom extends Room {
  dispatcher = new Dispatcher(this)

  onCreate(options) {
    this.setState(new FaithRoomState())

    this.onMessage('type', (client, data) => {
      console.log('type: client, data: ', client, data)
      const player = this.state.players[client.sessionId]
      // player.x += data.x
      // player.y += data.y
      console.log(
        client.sessionId + ' has: faithTokensAmount ' + player.lifeStonesAmount,
        'faithTokensAmount: ' + player.faithTokensAmount,
        'diceSymbols: ' + player.diceSymbols,
      )
      // tell everybody
      // this.room.send()
      this.broadcast('messages', `(${client.sessionId}) ${data}`)
    })
  }

  onJoin(client, options) {
    this.dispatcher.dispatch(new OnJoinCommand(), {
      sessionId: client.sessionId,
      room: this,
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
      this.dispatcher.dispatch(new OnLeaveCommand(), {
        sessionId: client.sessionId,
        // client,
      })
    }
  }

  onDispose() {
    this.dispatcher.stop()
    console.log('onDispose: room', this.roomId, 'disposing... FaithRoom')
  }
}
