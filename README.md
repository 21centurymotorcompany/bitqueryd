# bitqueryd

bitqueryd is a query engine for Bitquery.

bitquery is a Turing complete query language for Bitcoin.

# Prerequiesites

bitqueryd is a query engine that directly interfaces with a BitDB node. You must have access to a BitDB node through either a local or remote MongoDB URL.

> This library is for connecting directly to a BitDB MongoDB instance, and is not for HTTP access. If you're looking for a public HTTP endpoint, this library is not what you're looking for. You can instead use the HTTP-based API endpoint at [bitdb.network](https://bitdb.network), which takes only a couple of minutes to get your app up and running.

# Install

```
npm install --save bitqueryd
```

# Usage

First initialize, and use the returned db object to make the query. 

## 1. Using Promises


```
var bitqueryd = require('bitqueryd')
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
}
bitqueryd.init().then(function(db) {
  db.read(bql).then(function(response) {
    console.log("Response = ", response)
  })
})
```

## 2. Using Async-Await

```
var bitqueryd = require('bitqueryd')
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
};
(async function () {
  let db = await bitqueryd.init();
  let response = await db.read(bql);
  console.log("Response = ", response)
})();
```

> Note: By default bitquery connects to `mongodb://localhost:27017` so you don't need to configure anything if you set up BitDB without changing anything.

# BitDB Query Language

BitDB Query Language is a meta query language that builds on top of MongoDB query language, which means it supports all MongoDB operations.

Top level attributes:

- v: version
- q: query (MongoDB query)
- r: response handler (powered by [jq](https://stedolan.github.io/jq/))

Learn more here: [https://docs.bitdb.network](https://docs.bitdb.network)

# Configuration

You can set the following two options:

1. **url:** BitDB Node URL
2. **timeout:** Request timeout

## 1. url

Select the BitDB URL to connect to. 

```
bitqueryd.init({
  url: "mongodb://localhost:27017"
}).then(function(db) {
  ...
})
```

## 2. timeout

Set request timeout in milliseconds. All BitDB requests will time out after this duration.

```
bitqueryd.init({
  timeout: 20000
}).then(function(db) {
  ...
})
```
