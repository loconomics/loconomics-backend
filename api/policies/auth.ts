declare var sails: any;

export = (req, res, next) => {
  let action = sails.getActions()[req.options.action]
  let metadata = action.toJSON()
  let requiredRoles = metadata.requiredRoles || []
  if(req.authenticated)
    return next()
  const base = `/${req.getLocale()}/rest/`
  return res.unauthorized({
    requiredLevel: requiredRoles,
    login: `${base}login`,
    signup: `${base}signup`
  })
}
