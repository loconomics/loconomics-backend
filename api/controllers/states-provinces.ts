import {StateProvince, getRepository} from "@loconomics/data"
import {serialize} from "class-transformer"

declare var sails: any;

module.exports = {
  friendlyName: 'States/provinces lookup',
  description: 'Lists states/provinces for the current country',
  exits: {
    success: {
      outputExample: [
        {
        }
      ]
    }
  },
  fn: async function(inputs, exits) {
    const StatesProvinces = await getRepository(StateProvince)
    const data = await StatesProvinces.find({
      select: ["stateProvinceName", "stateProvinceCode"],
      where: {countryId: sails.config.custom.countryID}
    })
    return exits.success(serialize(data))
  }
}
