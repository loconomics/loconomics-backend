module.exports = {

  attributes: {
    id: {
      type: 'number',
      unique: true,
      columnName: 'CountryID'
    },
    name: {
      type: 'string',
      required: true,
      columnName: 'CountryName'
    },
    code: {
      type: 'string',
      required: true,
      columnName: 'CountryCode'
    },
    codeAlpha2: {
      type: 'string',
      required: true,
      columnName: 'CountryCodeAlpha2'
    },
    callingCode: {
      type: 'string',
      required: true,
      columnName: 'CountryCallingCode'
    },
    active: { type: 'boolean', required: true },
    language: {
      model: 'language',
      columnName: 'LanguageID'
    },
    modifiedBy: { type: 'string', required: true }
  },

};
