var restify = require('restify');
// https://www.npmjs.com/package/restify-clients
var assert = require('assert');
var util = require('util');
var json2xls = require('json2xls');
var fs = require('fs');

var client = restify.createJsonClient({ url: 'https://pp.engineering.redhat.com/pp-admin/api/v1/releases/?fields=id%2Cshortname%2Cname%2Cga_date%2Cbu%2Cbu_shortname%2Cbu_name&format=json',
                                        rejectUnauthorized: false});

var URL = "";
client.get(URL,
         function(err, req, res, obj){
        console.log(util.inspect(err));
	//console.log(util.inspect(res));
        //console.log(util.inspect(obj));
        var xls = json2xls(obj);
        fs.writeFileSync('data.xlsx', xls, 'binary');
        } );	
console.log("Finished");

