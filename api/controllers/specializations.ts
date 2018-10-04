declare var sails: any;

module.exports = {
  friendlyName: 'Search for specializations',
  // description: '',
  inputs: {
    searchTerm: {
      type: 'string',
      required: true
    },
    solutionID: {
      type: 'number',
      required: true
    }
  },
  exits: {
    success: {
      outputType: 'ref'
    },
    notFound: {
      responseType: "notFound"
    }
  },
  fn: async function(inputs, exits) {
    const {searchTerm, solutionID} = inputs
    const sql = await sails.helpers.mssql()
    const data = await sql.query(`
      select top 20
        specializationID,
        name
      from specialization
      where (Approved = 1 OR Approved is null)
        and languageID = ${this.req.languageID}
        and countryID = ${this.req.countryID}
        and name like '%${searchTerm}%'
        and (${solutionID} = 0 or ${solutionID} = solutionID)
      order by DisplayRank, name
    `)
    return exits.success(data.recordset)
  }
}
