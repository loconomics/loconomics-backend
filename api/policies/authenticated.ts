import BearerStrategy = require('passport-http-bearer')
import passport = require('passport')

passport.use(new BearerStrategy(
  (token, done) => {
    // Find the user based on the token.
    // Call `done(err)` if there's an error, `done(null, false)` if no user is found, done(null, user)` if a user is found.
    return done(null, false)
  },
))

export = passport.authenticate('bearer')
