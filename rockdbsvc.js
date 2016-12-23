// Getting started check out:
// http://dailyjs.com/2013/05/02/leveldb-and-node-2/#

var util = require('util');
var restify = require('restify');
var plugins = require('restify-plugins');
var uuid = require('uuid/v4');

const winston = require('winston');

winston.level = 'debug';
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
        metadata.t = req.params._tablename;
        delete req.parms._tablename;
	key = key + req.params._tablename;
        if ("_key" in req.params){
           metadata.k =  req.params._key;
           delete req.parms._key;
          } else {
           metadata.k = uuid();
          }
       key = key + "\x00" + metadata.k;
       return(key);
}

function metadata(){
   this.data = {};
   this.meta = {};
   return(this);
}

function postNewData(db, req , res , next){
    
    winston.debug("postNewData");
    // winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
    metadata = {};
    k = MkKey(req,metadata);
    winston.debug(util.inspect(k));
    winston.debug(util.inspect(req.params));
    res.statusCode = 200;
    var data["meta"] = metadata;
    var data["data"] = req.params;
    db.put(k,data,function(err){
          if (err){
            res.statusCode = 400;
            winston.error("Rocksdb: " + util.inspect(err));
            }
          });
   
    res.send(res.statusCode,k.k);
    next();
    return;
}

function findData(db, req, res , next){
    winston.debug("findData");
    res.setHeader('Access-Control-Allow-Origin','*');
    //winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
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
var entries = [];

    winston.debug("findAllData");
    res.setHeader('Access-Control-Allow-Origin','*');
    //winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
    sk = RdAllKeyStart(req);
    ek = RdAllKeyEnd(req);
    res.statusCode = 200;
    db.createReadStream({ start: sk, end: ek })
        .on('data', function (entry) { entries.push(entry["data"]) })
        .on('close', function() { 
           res.send(res.statusCode,entries); });
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
//server.del({path : PATH +'/:dataId' , version: '0.0.1'} ,deleteData);


server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

 
 

function deleteData(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.remove({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
 
}

