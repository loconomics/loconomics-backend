module.exports = {
  friendlyName: 'Replace accented letters with similar ASCII',
  description: 'Use regex to replace accented characters with non-accented ASCII',
  inputs: {
    phrase: {
      type: 'string',
      example: 'ápple ëpple ípple õpple üpple ýpple ßpple çpple ñpple',
      description: 'The string to be transformed',
      required: true
    },
    changeLowerCases: {
      type: 'boolean',
      example: true,
      defaultsTo: true
    },
    changeUpperCases: {
      type: 'boolean',
      example: true,
      defaultsTo: true
    }
  },
  sync: true,
  fn: function (inputs, exits) {
    const {phrase, changeLowerCases, changeUpperCases} = inputs
    let result = ''
    if (phrase) {
      result = phrase
      if (changeLowerCases) {
        result = result.replace(/[àáâãäåæ]/g, 'a')
        result = result.replace(/[èéêë]/g, 'e')
        result = result.replace(/[ìíîï]/g, 'i')
        result = result.replace(/[òóôõöø]/g, 'o')
        result = result.replace(/[ùúûü]/g, 'u')
        result = result.replace(/[ý]/g, 'y')
        result = result.replace(/[ðþß]/g, 'b')
        result = result.replace(/[ç]/g, 'c')
        result = result.replace(/[ñ]/g, 'n')
      }
      if (changeUpperCases) {
        result = result.replace(/[ÀÁÂÃÄÅÆ]/g, 'A')
        result = result.replace(/[ÈÉÊË]/g, 'E')
        result = result.replace(/[ÌÍÎÏ]/g, 'I')
        result = result.replace(/[ÒÓÔÕÖØ]/g, 'O')
        result = result.replace(/[ÙÚÛÜ]/g, 'U')
        result = result.replace(/[Ý]/g, 'Y')
        result = result.replace(/[ÐÞß]/g, 'B')
        result = result.replace(/[Ç]/g, 'C')
        result = result.replace(/[Ñ]/g, 'N')
      }
    }
    return exits.success(result)
  }
};
