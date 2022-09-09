import { Command } from '@colyseus/command'

export class OnJoinCommand extends Command {
  execute({ sessionId }) {
    this.state.players[sessionId] = new Player()
  }
}
