/*
  Filter down to h1 and s2 attributes
*/
var bitquery = require('../index');
var bql = {
  "v": 3,
  "q": {
    "find": {
      "$text": { "$search": "bet" },
      "out.h1": "6d02"
    },
    "limit": 10
  },
  r: {
    f: "[ .[] | .blk as $blk | .tx as $tx | .out[1] | {unix_time: $blk.t, block: $blk.i, tx: $tx.h, msg: .s2} ]"
  }
};
(async function() {
  let db = await bitquery.init({
    url: process.env.url ? process.env.url : "mongodb://localhost:27017"
  });
  let response = await db.read(bql)
  console.log("Response = ", JSON.stringify(response, null, 2))
  db.exit()
})();
