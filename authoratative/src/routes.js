import { monitor } from '@colyseus/monitor'
import basicAuth from 'express-basic-auth'

export const defineRoutes = (app) => {
  const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
      admin: 'admin789',
    },
    unauthorizedResponse: getUnauthorizedResponse,
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true,
  })
  function getUnauthorizedResponse(req) {
    return req.auth
      ? 'Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected'
      : 'Wrong credentials provided, pls send correct user and password'
  }

  /**
   * Bind your custom express routes here:
   */
  app.get('/', (req, res) => {
    res.send('"It\'s time to kick ass and chew bubblegum!"')
  })

  /**
   * Bind @colyseus/monitor
   * It is recommended to protect this route with a password.
   * Read more: https://docs.colyseus.io/tools/monitor/
   */
  app.use(
    '/colyseus',
    basicAuthMiddleware,
    monitor({
      columns: [
        'roomId',
        'name',
        'clients',
        'maxClients',
        { metadata: 'spectators' }, // display 'spectators' from metadata
        'locked',
        'elapsedTime',
      ],
    }),
  )
}
