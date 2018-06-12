import httpProxy = require( "http-proxy")

const proxy = httpProxy.createProxyServer({
  changeOrigin: true
})

const backend = process.env.LOCONOMICS_BACKEND_URL || "https://www.loconomics.com"

export = (req, res) => {
  proxy.web(req, res, {target: backend})
}
