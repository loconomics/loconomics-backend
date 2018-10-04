import BearerStrategy = require('passport-http-bearer')
import passport = require('passport')

declare var sails: any;

passport.use(new BearerStrategy(
  async (token, done) => {
    const sql = await sails.helpers.mssql()
    let authorization = await sql.query(`select * from authorizations where token = '${token}'`)
    authorization = authorization.recordset[0]
    if(!authorization)
      return done(null, false)
    let user = await sql.query(`select * from users where UserId = '${authorization.UserID}'`)
    user = user.recordset[0]
    console.log(user)
    if(user)
      return done(null, user)
    return done(null, false)
  },
))

export = passport.authenticate('bearer', {session: false})
