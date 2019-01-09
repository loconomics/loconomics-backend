import {Connection} from "typeorm"
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
    const PostalCodes = await sails.helpers.connection.getRepository(PostalCode)
    const postalCode = PostalCodes.findOne(id)
    if(!postalCode)
      return exits.notFound({errorMessage: "Postal Code Not Valid."})
    const stateProvince = await postalCode.stateProvince
    const record = {city: postalCode.City, stateProvinceName: stateProvince.StateProvinceName, stateProvinceCode: stateProvince.StateProvinceCode}
    return exits.success(record)
  }
}
