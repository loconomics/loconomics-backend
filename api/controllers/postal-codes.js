module.exports = {
  inputs: {
    id: {
      example: "90001",
      required: true
    }
  },
  exits: {
    success: {
      outputExample: {
        city: "Los Angeles",
        stateProvinceCode: "CA",
        stateProvinceName: "California"
      }
    }
  },
  fn: async function(inputs, exits) {
    const {id} = inputs
    return exits.success({response: "OK"})
  }
}
