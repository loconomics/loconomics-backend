import locale from "locale"

export default (options) => {
  const locales = new locale.Locales(options.locales)
  return (req, res, next) => {
    if(req.path.startsWith("/api/v1/")) {
      const parts = req.path.split("/")
      const newPath = parts.slice(0, 3).concat(parts.slice(4)).join("/")
      req.url = newPath
    }
    console.log(req.url)
    locale(locales)(req, res, next)
  }
}
