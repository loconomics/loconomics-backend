import {PostalCode} from "@loconomics/data"

declare var sails: any;

module.exports = {
  friendlyName: 'Postal code lookup',
  description: 'Looks up a postal code, returning data on the city and state/province',
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
    const connection = await sails.helpers.connection()
    const PostalCodes = connection.getRepository(PostalCode)
    const postalCode = await PostalCodes.findOne({postalCode: id})
    if(!postalCode)
      return exits.notFound({errorMessage: "Postal Code Not Valid."})
    const stateProvince = await postalCode.stateProvince
    const record = {city: postalCode.city, stateProvinceName: stateProvince.stateProvinceName, stateProvinceCode: stateProvince.stateProvinceCode}
    return exits.success(record)
  }
}
