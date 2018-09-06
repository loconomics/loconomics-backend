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
    },
    notFound: {
      responseType: "notFound"
    }
  },
  fn: async function(inputs, exits) {
    const {id} = inputs
    return exits.notFound({errorMessage: "Postal Code Not Valid."})
  }
}
