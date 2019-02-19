import {Authorization, User} from "@loconomics/data"

import BearerStrategy = require('passport-http-bearer')
import passport = require('passport')

declare var sails: any;

passport.use(new BearerStrategy(
  async (token, done) => {
    const connection = await sails.helpers.connection()
    const Authorizations = await connection.getRepository(Authorization)
    const Users = await connection.getRepository(User)
    const authorization = await Authorizations.findOne({token: token})
    if(!authorization)
      return done(null, false)
    const user = await Users.findOne({userId: authorization.userId})
    console.log(user)
    if(user)
      return done(null, user)
    return done(null, false)
  },
))

export const auth = (req, res, next) => {
  passport.authenticate('bearer', (err, user, info) => {
    if(user)
      req.user = user
    req.authenticated = !!user
    next()
  })(req, res, next);
}

export const initialize = passport.initialize()
