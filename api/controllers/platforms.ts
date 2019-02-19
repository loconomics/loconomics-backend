import {Platform} from "@loconomics/data"
import {serialize} from "class-transformer"

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
    const connection = await sails.helpers.connection()
    const Platforms = await connection.getRepository(Platform)
    let data = await Platforms.find({
      select: [
        "platformId",
        "name",
        "shortDescription",
        "longDescription",
        "feesDescription",
        "positiveAspects",
        "negativeAspects",
        "advice",
        "signUpUrl",
        "signInUrl",
        "updatedDate",
      ]
    })
    data = data.map((v) => {
      if(v.positiveAspects)
        v.positiveAspects = JSON.parse(v.positiveAspects)
      if(v.negativeAspects)
        v.negativeAspects = JSON.parse(v.negativeAspects)
      if(v.advice)
        v.advice = JSON.parse(v.advice)
      return v
    })
    return exits.success(serialize(data))
  }
}
