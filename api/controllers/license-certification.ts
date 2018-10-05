declare var sails: any;

module.exports = {
  friendlyName: 'License certification lookup',
  // description: '',
  inputs: {
    id: {
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
    const {id} = inputs
    const sql = await sails.helpers.mssql()
    let data = await sql.query(`
      select
        licenseCertificationID,
        LicenseCertificationType as name,
        LicenseCertificationTypeDescription as description,
        LicenseCertificationAuthority as authority,
        verificationWebsiteUrl,
        howToGetLicensedUrl,
        createdDate,
        updatedDate,
        languageID
      from licensecertification                                 
      where
        licensecertificationID = ${id}
        and languageID = ${this.req.languageID}
        and active=1
    `)
    data = data.recordset
    if(data.length)
      return exits.success(data)
    return exits.notFound()
  }
}
