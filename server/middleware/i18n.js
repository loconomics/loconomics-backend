import locale from "locale"

export default (options) => {
  const locales = new locale.Locales(options.locales)
  return (req, res, next) => {
    if(req.path.startsWith("/api/")) {
      const parts = req.path.split("/")
      const newPath = parts.slice(0, 2).concat(parts.slice(3)).join("/")
      req.url = newPath
    }
    locale(locales)(req, res, next)
  }
}
