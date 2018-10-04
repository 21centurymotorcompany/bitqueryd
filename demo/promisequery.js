var bitquery = require('../index')
var bql = {
  v: 3,
  q: { find: { "out.h1": "6d0c" }, limit: 5 }
}
bitquery.init({
  url: process.env.url ? process.env.url : "mongodb://localhost:27017"
}).then(function(db) {
  db.read(bql).then(function(response) {
    console.log("Response = ", JSON.stringify(response, null, 2))
    db.exit()
  })
})
