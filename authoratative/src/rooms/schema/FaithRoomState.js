import { MapSchema, Schema, defineTypes } from '@colyseus/schema'

export class FaithRoomState extends Schema {
  constructor() {
    super()
    this.mySynchronizedProperty = 'Hello world'
    this.players = new MapSchema()
  }

  onCreate(options) {
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
    console.log('options.mode: ', options?.mode)
    if (options.mode === 'duo') {
      // do something!
    }
    if (options.maxClients) {
      // do something!
      console.log('maxClients: ', options.maxClients)
    }

    this.onMessage('action', (client, message) => {
      //
      // Triggers when 'action' message is sent.
      //
    })

    this.onMessage('*', (client, type, message) => {
      //
      // Triggers when any other type of message is sent,
      // excluding "action", which has its own specific handler defined above.
      //
      console.log(client.sessionId, 'sent', type, message)
    })
  }

  onJoin(client, options) {
    if (options.mode === 'duo') {
      // put this player into a team!
    }
  }

  update(deltaTime) {
    // implement your physics or world updates here!
    // this is a good place to update the room state
  }
}

defineTypes(FaithRoomState, {
  mySynchronizedProperty: 'string',
})
