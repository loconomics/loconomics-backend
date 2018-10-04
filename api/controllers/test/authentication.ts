declare var sails: any;

module.exports = {
  friendlyName: 'Authentication test',
  description: 'Returns authentication details for the current request',
  exits: {
    success: {
      outPutType: 'ref'
    },
    notFound: {
      responseType: "notFound"
    }
  },
  fn: function(inputs, exits) {
    return exits.success(this.req.user)
  }
}
