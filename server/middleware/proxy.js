import url from "url"

import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer()

export default () => {
  const backend = url.parse(process.env.LOCONOMICS_BACKEND_URL || "https://www.loconomics.com")
  return (req, res, next) => {
    req.headers.host = backend.host
    console.log("Backend", backend)
    proxy.web(req, res, {target: backend.href})
  }
}
