import httpProxy = require( "http-proxy")

const proxy = httpProxy.createProxyServer({
  changeOrigin: true
})

const backend = process.env.LOCONOMICS_BACKEND_URL || "https://www.loconomics.com"

export default () => {
  proxy.web(this.req, this.res, {target: backend})
}
