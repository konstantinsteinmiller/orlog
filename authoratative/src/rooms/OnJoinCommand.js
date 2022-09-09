import { Command } from '@colyseus/command'
import { Player } from './schema/Player.js'

export class OnJoinCommand extends Command {
  execute({ sessionId }) {
    this.state.players[sessionId] = new Player()
  }
}
