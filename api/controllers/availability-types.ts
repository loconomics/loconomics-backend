import {CalendarAvailabilityType} from "@loconomics/data"
import {serialize} from "class-transformer"
import {IsNull, Not} from "typeorm"

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
    const connection = await sails.helpers.connection()
    const CalendarAvailabilityTypes = await connection.getRepository(CalendarAvailabilityType)
    const data = await CalendarAvailabilityTypes.find({
      language: this.req.getLocale(),
      selectableAs: Not(IsNull()),
    })
    return exits.success(serialize(data))
  }
}
