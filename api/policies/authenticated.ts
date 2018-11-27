declare var sails: any;

export = (req, res, next) => {
  if(req.authenticated)
    return next()
  const base = `/${req.getLocale()}/rest/`
  return res.unauthorized({
    requiredLevel: "User",
    login: `${base}login`,
    signup: `${base}signup`
  })
}
