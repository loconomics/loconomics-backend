declare var sails: any;

export = async (req, res, next) => {
  if(req.path.startsWith('/api/v1')) {
    const parts = req.path.split('/')
    const candidate = parts[3]
    // Hacky hack to detect language code in path, replace when we standardize on request headers.
    if(candidate && candidate.length == 5 && candidate[2] == "-")
      req.setLocale(candidate)
    const split = rec.getLocale().split('-')
    const languageCode = split[0]
    const countryCode = split[1]
    const sql = await sails.helpers.mssql()
    let data = await sql.query(`select LanguageID from language where LanguageCode = '${languageCode}'`)
    req.languageID = data.recordset[0].LanguageID
    data = await sql.query(`select CountryID from country where CountryCodeAlpha2 = '${countryCode}'`)
    req.countryID = data.recordset[0].CountryID
    const newPath = parts.slice(0, 3).concat(parts.slice(4)).join('/')
    req.url = newPath
    return next()
  }
  next()
}
