import {Specialization, getRepository} from "@loconomics/data"
import {serialize} from "class-transformer"
import {Brackets} from "typeorm"

declare var sails: any;

module.exports = {
  friendlyName: 'Search for specializations',
  // description: '',
  inputs: {
    searchTerm: {
      type: 'string'
    },
    solutionID: {
      type: 'number'
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
    const Specializations = await getRepository(Specialization)
    const query = Specializations.createQueryBuilder()
      .where("Specialization.language = :language", {language: this.req.getLocale()})
      .andWhere(new Brackets((qb) => {
        qb.where("Specialization.Approved = 1")
          .orWhere("Specialization.Approved is null")
      }))
      .orderBy("Specialization.DisplayRank")
      .addOrderBy("Specialization.Name")
      .limit(20)
    if(solutionID)
      query.andWhere(new Brackets((qb) => {
        qb.where("specialization.solutionID = :solutionID", {solutionID})
          .orWhere("specialization.solutionID = 0")
      }))
    if(searchTerm)
      query.andWhere("Specialization.Name like :searchTerm", {searchTerm: `%${searchTerm}%`})
    const data = await query.getMany()
    return exits.success(serialize(data))
  }
}
