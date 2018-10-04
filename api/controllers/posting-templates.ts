declare var sails: any;

module.exports = {
  friendlyName: 'Posting template lookup',
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
        p.postingTemplateID,
        p.name,
        p.createdDate,
        p.updatedDate,
        p.modifiedBy
      from PostingTemplate as P
      where P.postingTemplateID = ${id}
        and P.languageID = ${this.req.languageID}
        and P.countryID = ${this.req.countryID}
    `)
    data = data.recordset[0]
    if(!data)
      return exits.notFound()
    const questions = await sql.query(`
      select
        Q.questionID,
        Q.questionTypeID,
        Q.question,
        Q.label,
        Q.helpBlock,
        Q.options,
        P.legend,
        P.branchLogic
      FROM Question as Q
        INNER JOIN postingTemplateQuestion as P
        ON Q.questionID = P.questionID
      WHERE P.postingTemplateID = ${id}
    `)
    data.questions = questions.recordset
    return exits.success(data)
  }
}
