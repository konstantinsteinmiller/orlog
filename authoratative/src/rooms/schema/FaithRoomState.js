import * as schema from '@colyseus/schema'

export class FaithRoomState extends schema.Schema {
  constructor() {
    super()
    this.mySynchronizedProperty = 'Hello world'
  }

  onCreate(options) {
    console.log('options.mode: ', options?.mode)
    if (options.mode === 'duo') {
      // do something!
    }
    if (options.maxClients) {
      // do something!
      console.log('maxClients: ', options.maxClients)
    }
  }
  onJoin(client, options) {
    if (options.mode === 'duo') {
      // put this player into a team!
    }
  }
}

schema.defineTypes(FaithRoomState, {
  mySynchronizedProperty: 'string',
})
