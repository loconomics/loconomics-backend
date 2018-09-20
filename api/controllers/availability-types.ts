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
    const sql = await sails.helpers.mssql()
    const data = await sql.query(`select  CalendarAvailabilityTypeID as AvailabilityTypeID, SelectableAs as DisplayName from CalendarAvailabilityType where LanguageID = ${this.req.languageID} and CountryID = ${this.req.countryID}`)
    return exits.success(data.recordset)
  }
}
