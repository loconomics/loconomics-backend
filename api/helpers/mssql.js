const sql = require('mssql')

module.exports = {
  fn: async function(inputs, exits) {
    const pool = await sql.connect(sails.config.custom.mssqlServerURL)
    return exits.success(pool)
  }
}
