module.exports = {
  attributes: {
    id: {
      type: 'number',
      unique: true,
      columnName: 'LanguageID'
    },
    name: {
      type: 'string',
      required: true,
      columnName: 'LanguageName'
    },
    active: { type: 'boolean', required: true },
    code: {
      type: 'string',
      required: true,
      columnName: 'LanguageCode'
    },
    country: {
      model: 'country',
      columnName: 'CountryID'
    },
    modifiedBy: { type: 'string', required: true }
  },

};
