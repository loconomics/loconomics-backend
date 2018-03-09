import locale from "locale"

export default (options) => {
  const locales = new locale.Locales(options.locales)
  return (req, res, next) => {
    if(req.path.startsWith("/api/")) {
      const parts = req.path.split("/")
      const candidate = parts[2]
      if(candidate && !req.headers["accept-language"]) {
        const locales = new locale.Locales(candidate)
        if(locales[0])
          req.headers["accept-language"] = locales[0].normalized
      }
      const newPath = parts.slice(0, 2).concat(parts.slice(3)).join("/")
      req.url = newPath
    }
    locale(locales)(req, res, next)
  }
}
