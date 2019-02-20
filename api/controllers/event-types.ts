import {CalendarEventType, getRepository} from "@loconomics/data"
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
    const CalendarEventTypes = await getRepository(CalendarEventType)
    let query: any = {select: ["eventTypeId", "eventType", "displayName"]}
    if(inputs.OnlySelectable)
      query.where = {displayName: Not(IsNull())}
    const data = await CalendarEventTypes.find(query)
    return exits.success(serialize(data))
  }
}
