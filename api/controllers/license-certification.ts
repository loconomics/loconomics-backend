import {LicenseCertification} from "@loconomics/data"
import {serialize} from "class-transformer"

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
    const connection = await sails.helpers.connection()
    const LicenseCertifications = await connection.getRepository(LicenseCertification)
    let data = await LicenseCertifications.find({
      select: [
        "licenseCertificationId",
        "licenseCertificationType",
        "licenseCertificationTypeDescription",
        "licenseCertificationAuthority",
        "verificationWebsiteUrl",
        "howToGetLicensedUrl",
        "createdDate",
        "updatedDate"
      ],
      where: {
        licenseCertificationId: id,
        active: 1,
        language: this.req.getLocale()
      },
    })
    if(data.length)
      return exits.success(serialize(data))
    return exits.notFound()
  }
}
