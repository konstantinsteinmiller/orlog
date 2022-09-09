import { FaithRoom } from './rooms/FaithRoom.js'

export const defineRooms = (gameServer) => {
  gameServer
    .define('TwoPlayerMatch', FaithRoom)
    .filterBy(['maxClients'])
    .filterBy(['mode'])
    .on('create', (room) => console.log('TwoPlayerMatch room created:', room.roomId))
    .on('dispose', (room) => console.log('TwoPlayerMatch room disposed:', room.roomId))
    .on('join', (room, client) => console.log(client.id, 'joined', room.roomId))
    .on('leave', (room, client) => console.log(client.id, 'left', room.roomId))
  gameServer.define('battle_woods', FaithRoom, { map: 'woods' }).filterBy(['maxClients'])
}
