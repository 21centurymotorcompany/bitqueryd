var bitquery = require('../index')
var bql = {
  "v": 3,
  "q": {
    "db": ["c"],
    "find": { "out.h1": "6d02" },
    "limit": 100
  },
  "r": {
    "f": "[ group_by(.blk.h)[] | { block_index: .[0].blk.i, posts: [.[] | .out[1].s2]} ]"
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
