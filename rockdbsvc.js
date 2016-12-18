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
server.use(restify.CORS());

 
server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});
 
var PATH = 'data'
server.get({path : PATH , version : '0.0.1'} , findAllData);
server.get({path : PATH +'/:dataId' , version : '0.0.1'} , findData);
server.post({path : PATH , version: '0.0.1'} ,postNewData);
server.del({path : PATH +'/:dataId' , version: '0.0.1'} ,deleteData);


server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

function postNewData(req , res , next){
    var job = {};
    job.title = req.params.title;
    job.description = req.params.description;
    job.location = req.params.location;
    job.postedOn = new Date();
 
    res.setHeader('Access-Control-Allow-Origin','*');
 
    jobs.save(job , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(201 , job);
            return next();
        }else{
            return next(err);
        }
    });
}
 
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

