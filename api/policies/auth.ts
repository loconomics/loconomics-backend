declare var sails: any;

export = (req, res, next) => {
  let action = sails.getActions()[req.options.action]
  let metadata = action.toJSON()
  let requiredLevel = metadata.requiredLevel || "user"
  if(req.authenticated)
    return next()
  const base = `/${req.getLocale()}/rest/`
  return res.unauthorized({
    requiredLevel,
    login: `${base}login`,
    signup: `${base}signup`
  })
}
