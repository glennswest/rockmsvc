var util = require('util');
var restify = require('restify');
var plugins = require('restify-plugins');
var uuid = require('uuid/v4');

const winston = require('winston');

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
function postNewData(req , res , next){
    
    // winston.debug(util.inspect(req));
    winston.debug("req: " + req.params._tablename);
    k = MkKey(req);
    winston.debug(util.inspect(k));
    winston.debug(util.inspect(req.params));
    return next();
}

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
//server.get({path : PATH +'/:dataId' , version : '0.0.1'} , findData);
server.post('/v1/:_tablename/', function(req, res, next){ postNewData(req, res, next);} );
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
 
function findData(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.findOne({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }
        return next(err);
    })
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

