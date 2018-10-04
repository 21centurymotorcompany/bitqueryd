/*
  - return mempool only
  - parse out tx hash and output scripts

  Warning: May sometimes throw E2BIG error if the mempool data size is large and your computer is small
  check "getconf ARG_MAX" from the terminal to see what your OS allows
*/
var bitquery = require('../index')
var bql = {
  v: 3,
  q: { db: ["u"], find: { } },
  r: {
    f: "[ .[] | {tx: .tx.h, inputs: [ .in[]? | .str ], outputs: [ .out[]? | .str ] } ]"
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
