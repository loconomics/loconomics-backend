declare var sails: any;

export = (req, res, next) => {
  let action = sails.getActions()[req.options.action]
  let metadata = action.toJSON()
  let requiredLevel = metadata.requiredLevel
  if(req.user) {
    if(requiredLevel) {
      if(req.roles.includes(requiredLevel))
        return next()
    } else
      return next()
  }
  const base = `/${req.getLocale()}/rest/`
  return res.unauthorized({
    requiredLevel: requiredLevel,
    login: `${base}login`,
    signup: `${base}signup`
  })
}
