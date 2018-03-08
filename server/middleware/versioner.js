export default (options) => {
  const versionRegexp = /^\/api\/v([0-9+])\/.*/
  return (req, res, next) => {
    const matches = req.path.match(versionRegexp)
    if(matches) {
      req.apiVersion = matches[1]
      const parts = req.path.split("/")
      const newPath = parts.slice(0, 2).concat(parts.slice(3)).join("/")
      req.url = newPath
    }
    next()
  }
}
