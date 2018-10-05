var bitquery = require('../index')
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" }
  },
  "r": {
    "f": "[ .[] | { block: .blk.i?, timestamp: .blk.t?, content: .out[1].s2 }]"
  }
};
(async function() {
  let db = await bitquery.init({
    url: process.env.url ? process.env.url : "mongodb://localhost:27017"
  })
  let response = await db.read(bql)
  console.log("Response = ", JSON.stringify(response, null, 2))
  db.exit()
})();
