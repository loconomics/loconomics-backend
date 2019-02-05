import createConnection from "@loconomics/data"

declare var sails: any;

module.exports = {
  fn: async function(inputs, exits) {
    return exits.success(createConnection)
  }
}
