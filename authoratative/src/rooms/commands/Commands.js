import { Command } from '@colyseus/command'
import { Player } from '../schema/Player.js'

export class OnJoinCommand extends Command {
  execute({ sessionId, room }) {
    this.state.players[sessionId] = new Player()
    console.log('OnJoinCommand - players: ', this.state.players)
    room.broadcast('player_joined', {
      sessionId,
      message: `(${sessionId}) ${JSON.stringify(this.state.players[sessionId])}`,
    })
  }
}

export class OnLeaveCommand extends Command {
  execute({ sessionId }) {
    this.state.players.delete(sessionId)
    console.log('OnLeaveCommand players: ', this.state.players)
  }
}
