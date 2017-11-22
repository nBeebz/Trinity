var AMMO = require('ammonext');
var assert = require('assert');

describe('The AMMO object', function() {
    it('should be able to construct a zero-argument transform', function() {
      assert.notEqual('undefined', AMMO.btTransform());
    })
  })