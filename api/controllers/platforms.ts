declare var sails: any;

module.exports = {
  friendlyName: 'Platforms',
  description: 'Lists available platforms for which additional data can be added',
  exits: {
    success: {
      outputType: 'ref'
    },
  },
  fn: async function(inputs, exits) {
    const sql = await sails.helpers.mssql()
    let data = await sql.query(`
      select
        p.platformID,
        p.languageID,
        p.countryID,
        p.name,
        p.shortDescription,
        p.longDescription,
        p.feesDescription,
        p.positiveAspects,
        p.negativeAspects,
        p.advice,
        p.signUpURL,
        p.signInURL,
        p.updatedDate
      from platform as p
      where p.LanguageID = ${this.req.languageID}
        and p.CountryID = ${this.req.countryID}
    `)
    data = data.recordset.map((v) => {
      if(v.positiveAspects)
        v.positiveAspects = JSON.parse(v.positiveAspects)
      if(v.negativeAspects)
        v.negativeAspects = JSON.parse(v.negativeAspects)
      if(v.advice)
        v.advice = JSON.parse(v.advice)
      return v
    })
    return exits.success(data)
  }
}
