import querystring from "querystring"

import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer({
  changeOrigin: true
})

// Fix for https://github.com/nodejitsu/node-http-proxy/issues/180
proxy.on("proxyReq", (proxyReq, req) => {
  if(req.body) {
    const bodyData = querystring.stringify(req.body)
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData))
    // stream the content
    proxyReq.write(bodyData);
  }
})

export default () => {
  const backend = process.env.LOCONOMICS_BACKEND_URL || "https://www.loconomics.com"
  return (req, res, next) => {
    proxy.web(req, res, {target: backend})
  }
}
