import {Authorization, User, getRepository} from "@loconomics/data"

import BearerStrategy = require('passport-http-bearer')
import passport = require('passport')

declare var sails: any;

passport.use(new BearerStrategy(
  async (token, done) => {
    const Authorizations = await getRepository(Authorization)
    const Users = await getRepository(User)
    const authorization = await Authorizations.findOne({token: token})
    if(!authorization)
      return done(null, false)
    const user = await Users.findOne({userId: authorization.userId})
    if(user)
      return done(null, user)
    return done(null, false)
  },
))

export const auth = (req, res, next) => {
  passport.authenticate('bearer', (err, user, info) => {
    if(user) {
      req.user = user
      req.roles = []
      if(req.user.isProvider)
        req.roles.push("provider")
      if(req.user.isCustomer)
        req.roles.push("customer")
      if(req.user.isAdmin)
        req.roles.push("admin")
      if(req.user.isCollaborator)
        req.roles.push("collaborator")
      if(req.user.isHipaaAdmin)
        req.roles.push("hipaaAdmin")
      if(req.user.isContributor)
        req.roles.push("contributor")
      if(req.user.isOrganization)
        req.roles.push("organization")
    }
    next()
  })(req, res, next);
}

export const initialize = passport.initialize()
