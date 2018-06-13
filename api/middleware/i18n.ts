export = (req, res, next) => {
  if(req.path.startsWith("/api/v1")) {
    const parts = req.path.split("/")
    const candidate = parts[3]
    if(candidate && !req.headers["accept-language"])
      req.headers["accept-language"] = candidate
    const newPath = parts.slice(0, 3).concat(parts.slice(4)).join("/")
    req.url = newPath
  }
  next()
}
