const assert = require('assert');
const bitquery = require('./index.js')
const validate = bitquery.validate
describe('bitquery', function() {
  describe("top level", function() {
    it('a query without v is invalid', function() {
      let r = {
        q: { find: {} }
      }
      let isvalid = validate(r)
      assert.equal(isvalid.result, false)
      assert.equal(isvalid.status, 'invalid')
      assert(isvalid.errors.indexOf('v missing') >= 0)
    });
    it('a query with v is valid', function() {
      let r = {
        v: 2,
        q: { find: {} }
      }
      let isvalid = validate(r)
      assert.equal(isvalid.status, 'valid')
      assert.equal(isvalid.result, true)
    });
  })
  describe("encoding", function() {
  })
  describe("query", function() {
    it('is invalid if it doesnt have q', function() {
      let r = {
        v: 2
      }
      let isvalid = validate(r)
      assert.equal(isvalid.result, false)
      assert.equal(isvalid.status, 'invalid')
      assert(isvalid.errors.indexOf('q missing') >= 0)
    })
    it('top level q must contains something', function() {
      let r = {
        v: 2,
        q: {}
      }
      let isvalid = validate(r)
      assert.equal(isvalid.result, false)
      assert.equal(isvalid.status, 'invalid')
      assert(isvalid.errors.indexOf('q empty') >= 0)
    })
    it('top level q can only be one of the mongodb directives', function() {
      let r = {
        v: 2,
        q: {
          hello: "world"
        }
      }
      let isvalid = validate(r)
      assert.equal(isvalid.result, false)
      assert.equal(isvalid.status, 'invalid')
      const msg = "invalid MongoDB op(supported: find, aggregate, sort, project, limit, distinct)"
      assert(isvalid.errors.indexOf(msg) >= 0)
    })
    it('is valid if top level q contains find,aggregate,sort,project,limit,distinct', function() {
      let r = [{
        v: 2,
        q: {
          find: {}
        }
      }, {
        v: 2,
        q: {
          aggregate: {}
        }
      }, {
        v: 2,
        q: {
          find: {},
          sort: {}
        }
      }, {
        v: 2,
        q: {
          distinct: {}
        }
      }]
      r.forEach(function(item) {
        let isvalid = validate(item)
        assert.equal(isvalid.status, 'valid')
        assert.equal(isvalid.result, true)
      })
    })
  })
});
