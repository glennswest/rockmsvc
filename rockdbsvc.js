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
        var key = {};
	key.n = req.params._tablename;
        key.k = req.params._dataid;
        return(key);
}

function MkKey(req)
{
        var key = {};
	key.n = req.params._tablename;
        delete req.params._tablename;
        if ("_key" in req.params){
           key.k = req.params._key;
           delete req.params._key;
          } else {
           key.k = uuid();
          }
       return(key);
}

function postNewData(db, req , res , next){
    
    winston.debug("postNewData");
    // winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
    k = MkKey(req);
    winston.debug(util.inspect(k));
    winston.debug(util.inspect(req.params));
    res.statusCode = 200;
    db.put(k,req.params,function(err){
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
              res.send(res.statusCode,value);
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
 
//server.get({path : PATH , version : '0.0.1'} , findAllData);
server.get('/v1/:_tablename/:_dataid', function(req, res, next){
            findData(db,req,res,next);});
server.post('/v1/:_tablename/', function(req, res, next){
            postNewData(db,req,res,next);});
//server.del({path : PATH +'/:dataId' , version: '0.0.1'} ,deleteData);


server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

 
function findAllData(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
 
    });
 
}
 

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

