declare var sails: any;

module.exports = {
  friendlyName: 'Transform ugly strings into a consistent format',
  description: 'Will transform "some $ugly ###url wit[]h spaces" into "some-ugly-url-with-spaces"',
  inputs: {
    phrase: {
      type: 'string',
      example: 'some $ugly ###url wit[]h spaces',
      description: 'The string to be transformed',
      required: true
    },
    maxLength: {
      type: 'number',
      example: 25,
      defaultsTo: 50
    }
  },
  sync: true,
  fn: function (inputs, exits) {
    const {phrase, maxLength} = inputs
    let result = ''
    if (phrase) {
      result = phrase.toLowerCase()
      result = sails.helpers.replaceSpecialCharsWithAsciiEquivalent(result)
      result = result.replace(/[^a-z0-9\s-]/g, '')
      result = result.replace(/[\s-]+/g, ' ').trim()
      result = result.substring(0, result.length <= maxLength ? result.length : maxLength).trim()
      result = result.replace(/[\s-]/g, '-')
    }
    return exits.success(result)
  }
};
