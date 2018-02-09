import locale from "locale"

export default (options) => {
  const locales = new locale.Locales(options.locales)
  return locale(locales)
  }
