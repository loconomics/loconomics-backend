import fs from "fs"

import loopback from "loopback"

const ds = loopback.createDataSource("mssql", {url: process.env.DATABASE_URL})

//ds.discoverModelDefinitions({views: true, limit: 20}, cb)

const tables = {
  authorization: "authorizations",
  user: "users"
}

for(const key in tables) {
  const modelName = key
  const tableName = tables[modelName]
  ds.discoverSchema(tableName, (err, model) => {
    if(err)
      return console.error(err)
    const modelFile = fs.openSync(`common/models/${modelName}.json`, "w")
    const modelDefinition = JSON.stringify(model, null, 2)
    fs.writeSync(modelFile, modelDefinition)
  })
}
