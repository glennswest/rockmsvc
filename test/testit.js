var restify = require('restify');
// https://www.npmjs.com/package/restify-clients
var assert = require('assert');

var client = restify.createJsonClient('http://localhost:8080');
client.post('/v1/macaddress',{ hello: 'world' }, function(err, req, req, obj){
assert.ifError(err);
  console.log('%d -> %j', res.statusCode, res.headers);
  console.log('%j', obj);
});
//client.post('/v1/macaddress',{ _key: "glenn", hello: 'world' }, function(err, req, req, obj){
//assert.ifError(err);
//  console.log('%d -> %j', res.statusCode, res.headers);
// console.log('%j', obj);
// });

