declare var sails: any;

module.exports = {
  friendlyName: 'Event types lookup for calendar events',
  description: 'With the `OnlySelectable` query parameter, only returns event types that can be selected',
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
    const sql = await sails.helpers.mssql()
    let query = `select EventTypeID, EventType as InternalName, DisplayName from CalendarEventType`
    if(this.req.query.OnlySelectable)
      query += ` where DisplayName is not null`
    const data = await sql.query(query)
    return exits.success(data.recordset)
  }
}
