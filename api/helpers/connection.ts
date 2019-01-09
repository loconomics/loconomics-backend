import createConnection from "@loconomics/data"

declare var sails: any;

module.exports = {
  fn: async function(inputs, exits) {
    const c = await createConnection({
      type: "mssql",
      url: process.env.MSSQLSERVER_URL,
    })
    return exits.success(c)
  }
}
