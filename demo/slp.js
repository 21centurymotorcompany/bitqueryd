/*
  Get SLP Genesis Transactions
*/
var bitquery = require('../index')
var bql = {
  v: 3,
  q: {
    find: { "out.h1": "534c5000", "out.s3": "GENESIS" },
    limit: 20,
    project: { "out.$": 1, "_id": 0 }
  },
  r: {
    f: "[.[] | .out[0] | {title: \"[\\(.s4)] \\(.s5)\", document_url: .s6} ]"
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
