import * as Colyseus from 'colyseus.js'
import { getStorage, setStorage } from '@/Utils/storage.js'
import { isDev } from '@/Utils/utils.js'
const GAME_ROOM_SESSION_ID = 'TRIALS_OF_FAITH_ROOM_SESSION_ID'
const GAME_ROOM_ID = 'TRIALS_OF_FAITH_ROOM_ID'

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
      console.log(this.room.sessionId, 'joined successfully to ', this.room.name, '-', this.room.id)
      setStorage(GAME_ROOM_ID, this.room.id, isDev)
      setStorage(GAME_ROOM_SESSION_ID, this.room.sessionId, isDev)
    } catch (e) {
      console.error('JOIN ERROR', e)
    }

    // this.room.onStateChange.once((state) => {
    //   console.log('this is the first room state!', state)
    // })

    this.room.onStateChange((state) => {
      console.log(this.room.name, 'has new state:', state)
    })

    this.room.onMessage('message_type', (message) => {
      console.log(this.room.sessionId, 'received on', this.room.name, message)
    })

    this.room.onMessage('player_joined', ({ sessionId, message }) => {
      const storedSessionId = getStorage(GAME_ROOM_SESSION_ID, isDev)
      if (sessionId !== storedSessionId) {
        console.log('A NEW Player joined your game: ', message)
      }
    })

    this.room.onError((code, message) => {
      console.log(this.room.sessionId, "couldn't join", this.room.name, code, message)
    })

    this.room.onLeave((code) => {
      if (code === 1006) {
        console.log('server got disconnected')
      } else {
        console.log(this.room.sessionId, 'left', this.room.name, code)
      }
    })
  }

  async rejoinExistingMatch() {
    /* set allowReconnection()  in the server */
    try {
      const roomId = getStorage(GAME_ROOM_ID, isDev)
      const sessionId = getStorage(GAME_ROOM_SESSION_ID, isDev)
      if (roomId && sessionId) {
        this.room = await this.client.reconnect(roomId, sessionId)
        console.log('RE-JOINED successfully', this.room)
      }
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
