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
    const LicenseCertifications = await sails.helpers.connection.getRepository(LicenseCertification)
    let data = LicenseCertifications.find({
      select: [
        "licenseCertificationID",
        "licenseCertificationType",
        "LicenseCertificationTypeDescription",
        "LicenseCertificationAuthority",
        "verificationWebsiteUrl",
        "howToGetLicensedUrl",
        "createdDate",
        "updatedDate"
      ],
      where: {
        licenseCertificationID: id,
        active: 1,
        language: this.req.getLocale()
      },
    })
    if(data.length)
      return exits.success(serialize(data))
    return exits.notFound()
  }
}
