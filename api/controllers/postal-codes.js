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
    const sql = await sails.helpers.mssql()
    let data = await sql.query(`select * from postalcode where PostalCode = ${id}`)
    const postalCode = data.recordset[0]
    if(!postalCode)
      return exits.notFound({errorMessage: "Postal Code Not Valid."})
    data = await sql.query(`select * from stateprovince where StateProvinceID = ${postalCode.StateProvinceID}`)
    const stateProvince = data.recordset[0]
    const record = {city: postalCode.City, stateProvinceName: stateProvince.StateProvinceName, stateProvinceCode: stateProvince.StateProvinceCode}
    return exits.success(record)
  }
}
