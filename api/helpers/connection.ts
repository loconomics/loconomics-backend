import connection from "@loconomics/data"

declare var sails: any;

module.exports = {
  fn: async function(inputs, exits) {
    const c = await connection
    return exits.success(c)
  }
}
