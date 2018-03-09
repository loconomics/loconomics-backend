export default (server) => {
  // enable authentication
  const {db} = server.dataSources
  // Don't touch the existing Users table in non-development environments for now.
  if(process.env.NODE_ENV == "development")
    db.automigrate("Member")
  db.automigrate("Token")
  db.automigrate("ACL")
  db.automigrate("RoleMapping")
  db.automigrate("Role")
  server.enableAuth()
}
