declare var sails: any;

module.exports = {
  friendlyName: 'Retrieve the userID of user making a request',
  description: 'Retrieve the userID of user making the request based on the \
    bearer token in authorization header, or return -1 for a user that is not authenticated',
  inputs: {
    req: {
      type: 'ref',
      description: 'The current incoming request (req).',
      required: true
    }
  },
  fn: async function (inputs, exits) {
      const {req} = inputs
      const sql = await sails.helpers.mssql()
      let result = -1
      if (req.headers['authorization']) {
        const headerParts = req.headers['authorization'].split(' ')
        const token = (headerParts[0].toLowerCase() === 'bearer')
          ? headerParts[1]
          : ''

        if (token) {
          let queryResult = await sql.query(`select UserID from authorizations where token = '${token}'`)
          queryResult = queryResult.recordset[0]
          if (queryResult)
            result = queryResult.UserID
        }
      }
      return exits.success(result)
    }
}
