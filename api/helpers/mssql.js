const sql = require('mssql')

const pool = new sql.ConnectionPool(sails.config.custom.mssqlServerURL)
  .connect()
  .then((pool) => pool)

module.exports = {
  fn: async function(inputs, exits) {
    const p = await pool
    const request = new sql.Request(p)
    return exits.success(request)
  }
}
