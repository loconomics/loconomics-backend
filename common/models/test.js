export default (Test) => {

  Test.ping = (cb) => {
    cb(null, "pong")
  }
  Test.remoteMethod("ping", {
    returns: {arg: "pong", type: "string"}
  })

}
