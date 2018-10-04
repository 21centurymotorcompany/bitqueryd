# bitqueryd

## 1. What is bitquery?

bitquery is a Turing complete query language for Bitcoin.

![f](./f.png)

bitquery is a **portable**, **self-contained**, and **programmable** query language that lets you:

1. **Query** bitcoin using a [mongodb query language](https://docs.mongodb.com/manual/tutorial/query-documents/)
2. **Process** the result using [jq](https://en.wikipedia.org/wiki/Jq_(programming_language)), a turing complete functional programming language
3. Within a single **self-contained declarative query**.

With this combination, you can create your own custom API that's:

- **portable:** written in JSON, it's natively supported by all devices, OS, programming languages, and databases.
- **self-contained:** since the processing function can transform the query result into any format, the query can act as a high level API.
- **programmable:** combine with other queries to build apps that talk to one another based on bitcoin state

## 2. What is bitqueryd?

bitqueryd is a query engine that:

1. Connects to a [bitdb](https://bitdb.network) node and
2. Let you interact with bitdb using the bitquery language.

# bitquery syntax

bitquery is a meta query language that builds on top of MongoDB query language, which means it supports all MongoDB operations.

But it also handles many other things, for example:

- **Encoding:** takes care of all the hassle with push data encoding 
- **Processing:** lets you embed a full post-processing logic into the query itself.

![q](./q.png)

Top level attributes:

- v: version
- q: query (MongoDB query)
- r: response handler (powered by [jq](https://stedolan.github.io/jq/))

Learn more here: [https://docs.bitdb.network](https://docs.bitdb.network)


# prerequiesites

bitqueryd is a query engine that directly interfaces with a BitDB node. You must have access to a BitDB node through either a local or remote MongoDB URL.

> This library is for connecting directly to a BitDB MongoDB instance, and is not for HTTP access. If you're looking for a public HTTP endpoint, this library is not what you're looking for. You can instead use the HTTP-based API endpoint at [bitdb.network](https://bitdb.network), which takes only a couple of minutes to get your app up and running.

# install

```
npm install --save bitqueryd
```

# usage

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


# configuration

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
