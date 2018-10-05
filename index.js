require('dotenv').config()
const jq = require('bigjq')
const bcode = require('bcode')
const MongoClient = require('mongodb').MongoClient
const traverse = require('traverse')
const dbTypes = ["u", "c"]
const dbMapping = {
  u: "unconfirmed",
  c: "confirmed"
}
const ops = ["db", "find", "aggregate", "sort", "project", "limit", "skip", "distinct"]
var db, client
var timeout = null
var validate = function(r) {
  if (typeof r.v === 'undefined') {
    return { status: "invalid", result: false, errors: ["v missing"] }
  }
  if (typeof r.q === 'undefined') {
    return { status: "invalid", result: false, errors: ['q missing'] }
  }
  let keys = Object.keys(r.q)
  if (keys.length === 0) {
    return { status: "invalid", result: false, errors: ['q empty'] }
  }
  let errors = []
  for (let i=0; i<keys.length; i++) {
    if (ops.indexOf(keys[i]) < 0) {
      errors.push("invalid MongoDB op(supported: find, aggregate, sort, project, limit, distinct)")
      return { status: "invalid", result: false, errors: errors }
    }
  }
  return { status: "valid", result: true }
}
var read = async function(r) {
  let isvalid = validate(r)
  if (!isvalid.result) return isvalid;

  let result = {}
  // 1. v: version
  // 2. q: query
  // 3. r: response
  if (r.q) {
    let query = r.q
    let encoding = r.e  // legacy for v2 (deprecated with v3)
    let resfilter = r.r
    if (query.find) {
      query.find = bcode.encode(query.find, encoding)
    } else if (query.aggregate) {
      query.aggregate = bcode.encode(query.aggregate, encoding)
    }
    let promises = []
    let src = (query.db && query.db.length > 0) ? query.db : dbTypes
    for (let i=0; i<src.length; i++) {
      let key = src[i];
      if (src.indexOf(key) >= 0) {
        promises.push(lookup({ request: query, encoding: encoding }, key, resfilter))
      }
    }

    try {
      let responses = await Promise.all(promises)
      responses.forEach(function(response) {
        result[response.name] = response.items
      })
    } catch (e) {
      if (result.errors) {
        result.errors.push(e.toString())
      } else {
        result.errors = [e.toString()]
      }
    }
  }
  return result
}
var exit = function() {
  client.close()
}
var init = function(config) {
  return new Promise(function(resolve, reject) {
    let url = (config && config.url ? config.url : "mongodb://localhost:27017")
    let name = (config && config.name ? config.name : "bitdb")
    let sockTimeout = (config && config.timeout) ? config.timeout + 100 : 20100
    if (/mongodb:.*/.test(url)) {
      MongoClient.connect(url, {
        useNewUrlParser: true,
        socketTimeoutMS: sockTimeout
      }, function(err, _client) {
        if (err) console.log(err)
        client = _client
        if (config && config.timeout) {
          timeout = config.timeout
        }
        db = client.db(name)
        resolve({ read: read, exit: exit })
      })
    } else {
      reject("Invalid Node URL")
    }
  })
}
var lookup = function(r, key, resfilter) {
  let collectionName = dbMapping[key]
  let collection = db.collection(collectionName)
  let query = r.request
  return new Promise(async function(resolve, reject) {
    let cursor
    if (query.find || query.aggregate) {
      if (query.find) {
        cursor = collection.find(query.find, { allowDiskUse:true })
      } else if (query.aggregate) {
        cursor = collection.aggregate(query.aggregate, { allowDiskUse:true })
      }
      if (query.sort) {
        cursor = cursor.sort(query.sort)
      } else {
        cursor = cursor.sort({'blk.i': -1})
      }
      if (query.project) {
        cursor = cursor.project(query.project)
      }
      if (query.skip) {
        cursor = cursor.skip(query.skip)
      }
      if (query.limit) {
        cursor = cursor.limit(query.limit)
      } else {
        cursor = cursor.limit(100)
      }
      if (timeout) {
        cursor = cursor.maxTimeMS(timeout)
      }

      cursor.toArray(async function(err, docs) {
        if (err) {
          reject(err)
        } else {
          let res = docs;
          res = bcode.decode(docs, r.encoding)
          
          // response filter
          if (resfilter && resfilter.f && res.length > 0) {
            try {
              let f = resfilter.f;
              let result = await jq.run(f, res)
              resolve({
                name: key,
                items: result
              })
            } catch (e) {
              reject(e)
            }
          } else {
            resolve({
              name: key,
              items: res
            })
          }
        }
      })

    } else if (query.distinct) {
      if (query.distinct.field) {
        try {
          let items = await collection.distinct(query.distinct.field, query.distinct.query, query.distinct.options)
          let res = items
          res = bcode.decode(docs, r.encoding)
          resolve({
            name: key,
            items: res
          })
        } catch (e) {
          reject(e)
        }
      }
    }
  })
}
module.exports = {
  init: init,
  exit: exit,
  read: read,
  validate: validate
}
