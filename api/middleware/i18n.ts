declare var sails: any;

export = async (req, res, next) => {
  if(req.path.startsWith('/api/v1')) {
    // Hacky hack to detect language code in path, replace when we standardize on request headers.
    const parts = req.path.split('/')
    const candidate = parts[3]
    if(candidate && candidate.length == 5 && candidate[2] == "-")
      req.setLocale(candidate)
    const newPath = parts.slice(0, 3).concat(parts.slice(4)).join('/')
    req.url = newPath
    return next()
  }
  next()
}
