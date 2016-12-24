// Getting started check out:
// http://dailyjs.com/2013/05/02/leveldb-and-node-2/#

var util = require('util');
var restify = require('restify');
var plugins = require('restify-plugins');
var uuid = require('uuid/v4');

const winston = require('winston');

winston.level = 'info';
winston.info(require.main.filename);

winston.debug("Setup Connection to Rocksdb")
var levelup = require('levelup')
var db = levelup('mydb', { valueEncoding: 'json' })

function RdKey(req)
{
        var key = "";
	key = key + req.params._tablename;
        key = key + "\x00" + req.params._dataid;
        return(key);
}

function RdAllKeyStart(req)
{
        var key = "";
	key = key + req.params._tablename;
        key = key + "\x00";
        return(key);
}

function RdAllKeyEnd(req)
{
        var key = "";
	key = key + req.params._tablename;
        key = key + "\xff";
        return(key);
}

function MkKey(req)
{
        var key = "";
        metadata = {};
	key = key + req.params._tablename;
        if ("id" in req.params){
           k =  req.params.id;
          } else {
           k = uuid();
           req.params.id = k;
          }
       key = key + "\x00" + k;
       metadata.id  = k;
       metadata.tab = req.params._tablename;
       metadata.key = key;
       return(metadata);
}

function postNewData(db, req , res , next){
    
    // winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
    metadata = MkKey(req);
    k = metadata.key;
    //winston.debug(util.inspect(k));
    //winston.debug(util.inspect(req.params));
    res.statusCode = 200;
    data = {};
    
    data.meta = metadata;
    data.data = req.params;
    data.data.id = metadata.id;
    delete data.data._tablename;
    //winston.debug("Before Put" + util.inspect(data));
    db.put(k,data,function(err){
          if (err){
            res.statusCode = 400;
            winston.error("Rocksdb: " + util.inspect(err));
            }
          });
   
    res.send(res.statusCode,data.data.id);
    next();
    return;
}

function findData(db, req, res , next){
    winston.debug("findData");
    res.setHeader('Access-Control-Allow-Origin','*');
    //winston.debug(util.inspect(req));
    //winston.debug("req: " + req.params._tablename);
    k = RdKey(req);
    winston.debug(util.inspect(k));
    //winston.debug(util.inspect(req.params));
    res.statusCode = 200;
    db.get(k,function(err,value){
          if (err){
            res.statusCode = 400;
            winston.error("Rocksdb: " + util.inspect(err));
            } else {
              winston.debug("findData: Object: " + util.inspect(value));
              res.send(res.statusCode,value["data"]);
            }
          });
    next();
    return;
}

function findAllData(db, req, res , next){

    winston.debug("findAllData");
    res.setHeader('Access-Control-Allow-Origin','*');
    //winston.debug(util.inspect(req));
    //winston.debug("req: " + req.params._tablename);
    sk = RdAllKeyStart(req);
    ek = RdAllKeyEnd(req);
    //winston.debug("sk: " + util.inspect(sk));
    //winston.debug("ek: " + util.inspect(ek));
    res.statusCode = 200;
    entries = [];
    db.createReadStream({ start: sk, end: ek })
        .on('data', function (entry) { entries.push(entry.value.data); })
        .on('close', function() { 
           if (entries){
              res.send(res.statusCode,entries); 
             } else {
              res.statusCode = 400;
              res.send(res.statusCode);
            }
          });
    next();
    return;

}

function deleteData(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');

    k = RdKey(req);
    winston.debug(util.inspect(k));
    //winston.debug(util.inspect(req.params));
    res.statusCode = 204;
    db.del(k,function(err,value){
          if (err){
            res.statusCode = 400;
            winston.error("Rocksdb: " + util.inspect(err));
            } else {
              res.send(res.statusCode);
            }
          });
    next();
    return;
}

winston.debug("Setup Restify Server")
const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: true,
    mapFiles: false,
    overrideParams: false,
    keepExtensions: false,
    multiples: true
 }));



 
server.get('/echo/:_tablename', function (req, res, next) {
  res.send(req.params);
  return next();
});
 
server.get('/v1/:_tablename', function(req, res, next){
            findAllData(db,req,res,next);});
server.get('/v1/:_tablename/:_dataid', function(req, res, next){
            findData(db,req,res,next);});
server.post('/v1/:_tablename/', function(req, res, next){
            postNewData(db,req,res,next);});
server.del('/v1/:_tablename/:_dataid', function(req, res, next){
            deleteData(db,req,res,next);});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

 
 


