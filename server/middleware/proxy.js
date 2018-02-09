import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer()

export default () => (req, res, next) => {
  req.headers.host = "dev.loconomics.com"
  proxy.web(req, res, {target: "http://dev.loconomics.com"})
}
