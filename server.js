var http = require('http');
var fs = require('fs');
var express = require("express");
var exec = require('child_process').exec;
var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res){
	res.send('Hello Node!');
});

app.post('/',function(request, response){
	var payload = request.body.payload;
	payload = JSON.parse(payload);
	// console.log(payload);
	var runScript = false;
	var project = payload.repository.slug;
	for (var i = 0; i < payload.commits.length; i++) {
		if (payload.commits[i].branch == "master" && payload.commits[i].message.indexOf("[deploy:staging]")!=-1){
			runScript = true;
		}
	};
	var execOptions = {
	     maxBuffer: 1024 * 1024 // 1mb
	};
	if (runScript){
		var buffer = fs.readFile('./projects.json', function(err, data){
			data = JSON.parse(data);
			for (var i = 0; i < data.length; i++) {
				if (data[i].slug == project){
					var now = new Date();
					var log = data[i].name+" staging deployment: "+now.toString()+"\n";
					var bashCmd = "bash deploy.sh "+data[i].folder+" "+data[i].repo+" "+data[i].script;
					log += bashCmd+"\n";
					exec(bashCmd, execOptions, function(error, stdout, stderror){
						log += stdout;
						fs.writeFile(("projects/logs/"+project+'-log-'+now.getTime()), log);
					});
				}
			};
		});
	}
});

app.listen(8080);
