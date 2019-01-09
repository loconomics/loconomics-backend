import {CalendarEventType} from "@loconomics/data"
import {serialize} from "class-transformer"
import {IsNull, Not} from "typeorm"

declare var sails: any;

module.exports = {
  friendlyName: 'Event types lookup for calendar events',
  description: 'With the `OnlySelectable` query parameter, only returns event types that can be selected',
  inputs: {
    OnlySelectable: {
      example: false
    }
  },
  exits: {
    success: {
      outputExample: [
        {
          "EventTypeID": 1,
          "InternalName": "",
          "DisplayName": "booking"
        }
      ]
    }
  },
  fn: async function(inputs, exits) {
    const CalendarEventTypes = await sails.helpers.connection.getRepository(CalendarEventType)
    let query: any = {select: ["EventTypeID", "EventType", "DisplayName"]}
    if(inputs.OnlySelectable)
      query.DisplayName = Not(IsNull())
    const data = await CalendarEventTypes.find(query)
    return exits.success(serialize(data))
  }
}
