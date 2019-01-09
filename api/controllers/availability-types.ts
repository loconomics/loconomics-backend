import {CalendarAvailabilityType} from "@loconomics/data"
import {serialize} from "class-transformer"

declare var sails: any;

module.exports = {
  friendlyName: 'Availability types lookup',
  description: 'Retrieves availability types for calendar events',
  exits: {
    success: {
      outputExample: [
        {
          AvailabilityTypeID: 1,
          DisplayName: "Availability type name"
        }
      ]
    }
  },
  fn: async function(inputs, exits) {
    const CalendarAvailabilityTypes = await sails.helpers.connection.getRepository(CalendarAvailabilityType)
    const data = CalendarAvailabilityTypes.find({language: this.req.getLocale()})
    return exits.success(serialize(data))
  }
}
