import httpProxy = require( "http-proxy")

const proxy = httpProxy.createProxyServer({
  changeOrigin: true
})

const BACKEND = process.env.LOCONOMICS_BACKEND_URL || "https://www.loconomics.com"

export const backend = (req, res) => {
  proxy.web(req, res, {target: BACKEND})
}

export const pages = (req, res, next) => {
  if(req.path.startsWith("/pages"))
    return proxy.web(req, res, {target: "https://loconomics-pages.azurewebsites.net"})
  next()
}
