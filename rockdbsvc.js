var restify = require('restify');
var plugins = require('restify-plugins');

const winston = require('winston');

winston.level = 'debug';
winston.info(require.main.filename);

winston.debug("Load Up LevelUp")
var levelup = require('levelup')
winston.debug("Setup Connection to Rocksdb")
var db = levelup('mydb')

winston.debug("Setup Restify Server")
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(plugins.acceptParser(server.acceptable));
server.use(plugins.queryParser());
server.use(plugins.bodyParser());
 
 
server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});
 
server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

