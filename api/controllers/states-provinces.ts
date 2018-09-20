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
    const sql = await sails.helpers.mssql()
    const data = await sql.query(`select StateProvinceName as name, StateProvinceCode as code from stateprovince where CountryID = ${this.req.countryID}`)
    return exits.success(data.recordset)
  }
}
