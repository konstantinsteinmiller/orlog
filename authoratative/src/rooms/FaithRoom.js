import { Room } from '@colyseus/core'
import { FaithRoomState } from './schema/FaithRoomState.js'
// import { Dispatcher } from '@colyseus/command'

// import { OnJoinCommand } from './OnJoinCommand.js'

export class FaithRoom extends Room {
  // dispatcher = new Dispatcher(this)

  onCreate(options) {
    this.setState(new FaithRoomState())

    this.onMessage('type', (client, message) => {
      console.log('type: client, message: ', client, message)
      //
      // handle "type" message.
      //
    })
  }

  onJoin(client, options) {
    // this.dispatcher.dispatch(new OnJoinCommand(), {
    //   sessionId: client.sessionId,
    // })
    console.log(client.sessionId, 'joined FaithRoom!')
  }

  onLeave(client, consented) {
    console.log(client.sessionId, 'left FaithRoom!')
  }

  onDispose() {
    // this.dispatcher.stop()
    console.log('room', this.roomId, 'disposing... FaithRoom')
  }
}
