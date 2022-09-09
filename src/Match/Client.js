import * as Colyseus from 'colyseus.js'

export default class Client {
  constructor() {
    this.client = new Colyseus.Client('ws://127.0.0.1:3789')

    this.joinOrCreateGame()
  }

  destroy() {
    // unconsented leave
    console.log(this.destroy)
    alert('sad ure leaving')
    this.room.leave(false)
  }

  async joinOrCreateGame() {
    try {
      this.room = await this.client.joinOrCreate('TwoPlayerMatch', {
        mode: 'duo',
        maxClients: 2,
      })
      console.log('joined successfully', this.room)
      console.log(this.room.sessionId, 'joined', this.room.name, ' with clientId: ', this.client.id)
    } catch (e) {
      console.error('JOIN ERROR', e)
    }

    this.room.onStateChange.once((state) => {
      console.log('this is the first room state!', state)
    })
    this.room.onStateChange((state) => {
      console.log(room.name, 'has new state:', state)
    })

    this.room.onMessage('message_type', (message) => {
      console.log(this.client.id, 'received on', this.room.name, message)
    })

    this.room.onError((code, message) => {
      console.log(this.client.id, "couldn't join", this.room.name, code, message)
    })

    this.room.onLeave((code) => {
      console.log(this.client.id, 'left', this.room.name, code)
    })
  }

  async rejoinExistingMatch() {
    /* set allowReconnection()  in the server */
    try {
      this.room = await this.client.reconnect('wNHTX5qik', 'SkNaHTazQ')
      console.log('RE-JOINED successfully', this.room)
    } catch (e) {
      console.error('join error', e)
    }
  }

  async getAllRooms() {
    try {
      this.rooms = await this.client.getAvailableRooms('battle')
      this.rooms.forEach((room) => {
        console.log('-------------------------')
        console.log(room.roomId)
        console.log(room.clients)
        console.log(room.maxClients)
        console.log(room.metadata)
      })
    } catch (e) {
      console.error('could not retrieve all available rooms: ', e)
    }
  }

  async getSeatForReservation() {
    try {
      this.room = await this.client.consumeSeatReservation(this.reservation)
      console.log('joined successfully', this.room)
    } catch (e) {
      console.error('join error', e)
    }
  }

  leaveGame() {
    // consented leave
    this.room.leave()
  }
}
